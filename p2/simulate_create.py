#!/usr/bin/env python3
"""AnonPad P2 — mogz XMR-pair create flow, SIMULATE ONLY.

Runs the exact proven mogz sequence (upload -> metadata -> /api/tx/create
with quote="XMR" -> local sign -> /api/tx/cosign -> RPC simulateTransaction)
for one clearly-fake test coin, then STOPS. There is deliberately no send
path in this file: nothing here can broadcast a transaction.

Signs with the muse mogz wallet keypair (~/.config/muse-mogz/keypair.json,
read by the node helper at runtime, never copied or printed) purely so the
simulation runs against a fully-signed tx, mirroring the scout executor's
proven flow (gmgn-scout/executor.py, live fires 2026-10-30).

Output: p2/simulate-log.json + a printed summary.
"""
import base64, json, os, struct, subprocess, sys, time, zlib

HOME = os.path.dirname(os.path.abspath(__file__))
ROOT = os.path.dirname(HOME)
COOKIES = os.path.expanduser("~/.config/muse-mogz/cookies.txt")
KEYPAIR = os.path.expanduser("~/.config/muse-mogz/keypair.json")
SIGN_MJS = os.path.expanduser("~/workspace/narrative-ops/gmgn-scout/sign_tx.mjs")
NODE_HINT = os.path.expanduser("~/workspace/museinu/pump-v2")
WALLET = "2LYQUArYnaYR2YTePK99mUiYU5mFXn1qZqe5b3xGsvHt"
RPC = "https://api.mainnet-beta.solana.com"
API = "https://mogz.fun"
COIN = {"name": "AnonPad Sim Test", "ticker": "SIMT",
        "description": "P2 simulation only - not a launch, not a real coin."}

log = {"started": time.strftime("%Y-%m-%dT%H:%M:%SZ", time.gmtime()),
       "mode": "SIMULATE_ONLY_NO_BROADCAST", "coin": COIN, "steps": []}


def note(step, **kw):
    log["steps"].append({"step": step, **kw})
    print(step, json.dumps(kw)[:300])


def curl(args, timeout=60):
    p = subprocess.run(["curl", "-s", "-b", COOKIES,
                        "-H", "User-Agent: Mozilla/5.0"] + args,
                       capture_output=True, text=True, timeout=timeout)
    return p.stdout


def api_json(method, path, body=None):
    args = ["-X", method, API + path, "-H", "Content-Type: application/json"]
    if body is not None:
        args += ["-d", json.dumps(body)]
    out = curl(args)
    try:
        return json.loads(out)
    except Exception:
        raise RuntimeError("%s %s -> unparseable: %s" % (method, path, out[:200]))


def tiny_png(path):
    def chunk(typ, data):
        c = struct.pack(">I", len(data)) + typ + data
        return c + struct.pack(">I", zlib.crc32(typ + data) & 0xffffffff)
    ihdr = struct.pack(">IIBBBBB", 64, 64, 8, 2, 0, 0, 0)
    raw = b""
    for _ in range(64):
        raw += b"\x00" + bytes([255, 102, 0]) * 64
    png = (b"\x89PNG\r\n\x1a\n" + chunk(b"IHDR", ihdr)
           + chunk(b"IDAT", zlib.compress(raw)) + chunk(b"IEND", b""))
    open(path, "wb").write(png)


def rpc(method, params):
    p = subprocess.run(["curl", "-s", "-X", "POST", RPC,
                        "-H", "Content-Type: application/json",
                        "-d", json.dumps({"jsonrpc": "2.0", "id": 1,
                                          "method": method, "params": params})],
                       capture_output=True, text=True, timeout=60)
    return json.loads(p.stdout)


def decode_tx(tx_b64):
    js = """
const {Transaction, VersionedTransaction} = require('@solana/web3.js');
const fs = require('fs');
const buf = Buffer.from(fs.readFileSync(0, 'utf8').trim(), 'base64');
try {
  const v = VersionedTransaction.deserialize(buf);
  const keys = v.message.staticAccountKeys.map(k => k.toBase58());
  console.log(JSON.stringify({kind:'versioned', feePayer: keys[0],
    signers: v.signatures.map(s => Buffer.from(s).toString('base64').slice(0,8)),
    instructions: v.message.compiledInstructions.map(ix => ({program: keys[ix.programIdIndex], nAccounts: ix.accountKeyIndexes.length})),
    accounts: keys}));
} catch (e) {
  const t = Transaction.from(buf);
  console.log(JSON.stringify({kind:'legacy', instructions: t.instructions.map(ix => ({program: ix.programId.toBase58(), nAccounts: ix.keys.length}))}));
}
"""
    p = subprocess.run(["node", "-e", js], input=tx_b64, capture_output=True,
                       text=True, timeout=60, cwd=NODE_HINT)
    if p.returncode != 0:
        return {"decode_error": (p.stderr or "")[:200]}
    return json.loads(p.stdout)


def main():
    # 0. session check
    me = api_json("GET", "/api/auth/me")
    user = me.get("user") or {}
    note("auth_me", username=user.get("username"), coinsCreated=user.get("coinsCreated"))
    if user.get("username") != "muse":
        raise RuntimeError("unexpected mogz session user: %r" % user.get("username"))

    # 1. upload image (fake test art: plain orange square, no text)
    img_path = os.path.join(HOME, "sim-art.png")
    tiny_png(img_path)
    out = curl(["-X", "POST", API + "/api/upload",
                "-F", "file=@" + img_path, "-F", "kind=coin"])
    up = json.loads(out)
    image_url = up.get("url") or up.get("image") or (up.get("data") or {}).get("url")
    note("upload_image", url=image_url)
    if not image_url:
        raise RuntimeError("upload returned no url: %s" % out[:200])

    # 2. upload metadata
    md = api_json("POST", "/api/upload/metadata",
                  {"name": COIN["name"], "symbol": COIN["ticker"],
                   "description": COIN["description"], "image": image_url})
    metadata_uri = md.get("uri") or md.get("url") or md.get("metadataUri")
    note("upload_metadata", uri=metadata_uri)
    if not metadata_uri:
        raise RuntimeError("metadata returned no uri: %s" % json.dumps(md)[:200])

    # 3. build create tx against the XMR pair
    payload = {"wallet": WALLET, "name": COIN["name"], "symbol": COIN["ticker"],
               "description": COIN["description"], "image": image_url,
               "uri": metadata_uri, "quote": "XMR",
               "rewardsMode": "creator", "firstBuyQuote": 0}
    created = api_json("POST", "/api/tx/create", payload)
    tx_b64 = created.get("tx") or created.get("transaction")
    note("tx_create", has_tx=bool(tx_b64), cosign=created.get("cosign"),
         mint=created.get("mint") or created.get("baseMint"))
    if not tx_b64:
        log["result"] = {"stage": "tx/create", "error": created}
        return finish()

    decoded = decode_tx(tx_b64)
    note("tx_decode_unsigned", **decoded)

    # 4. sign locally (mogz wallet) — signing is not broadcasting
    p = subprocess.run(["node", SIGN_MJS, KEYPAIR], input=tx_b64,
                       capture_output=True, text=True, timeout=60, cwd=NODE_HINT)
    if p.returncode != 0:
        raise RuntimeError("sign failed: %s" % (p.stderr or "")[:300])
    signed = p.stdout.strip()
    note("signed", changed=(signed != tx_b64))

    # 5. mogz cosign
    co = api_json("POST", "/api/tx/cosign",
                  {"tx": signed, "cosign": created.get("cosign", True)})
    final_tx = co.get("tx") or signed
    note("cosign", server_signed=(final_tx != signed))
    note("tx_decode_final", **decode_tx(final_tx))

    # 6. SIMULATE — the end of the line. No sendTransaction exists below.
    sim_resp = rpc("simulateTransaction",
                   [final_tx, {"encoding": "base64", "sigVerify": True,
                               "replaceRecentBlockhash": False}])
    sim = (sim_resp.get("result") or {}).get("value") or {}
    logs = sim.get("logs") or []
    note("simulate", err=sim.get("err"), unitsConsumed=sim.get("unitsConsumed"),
         n_logs=len(logs))
    log["result"] = {"stage": "simulate", "err": sim.get("err"),
                     "unitsConsumed": sim.get("unitsConsumed"),
                     "logs_tail": logs[-12:],
                     "accounts": (sim.get("accounts") or None)}
    return finish()


def finish():
    log["finished"] = time.strftime("%Y-%m-%dT%H:%M:%SZ", time.gmtime())
    log["broadcast"] = False
    with open(os.path.join(HOME, "simulate-log.json"), "w") as f:
        json.dump(log, f, indent=1)
    print("RESULT:", json.dumps(log["result"])[:600])
    print("log written to", os.path.join(HOME, "simulate-log.json"))


if __name__ == "__main__":
    main()
