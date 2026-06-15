# Detroit Wolverines GM

Static browser football GM game. No build step is required.

## Local Play

```powershell
py -m http.server 5173 --bind 0.0.0.0 --directory gridiron-gm
```

Open `http://127.0.0.1:5173/` on this computer.

## Phone Or Another Laptop On The Same Wi-Fi

1. Keep the local server running with `--bind 0.0.0.0`.
2. Find this computer's IPv4 address:

```powershell
ipconfig
```

3. On the phone or other laptop, open:

```text
http://YOUR_IPV4_ADDRESS:5173/
```

Windows may ask for a firewall allowance for Python. Allow private networks.

## Play From Anywhere

Deploy the contents of this `gridiron-gm` folder to any static host:

- GitHub Pages
- Cloudflare Pages
- Netlify
- Vercel static project

The game uses browser `localStorage`, so saves are per device/browser. Use Settings -> Export Save and Import Save to move a save between devices.

## Automatic Netlify Updates

For automatic updates, put this project in a GitHub repository and connect that repository to Netlify. The root `netlify.toml` tells Netlify to publish the `gridiron-gm` folder.

After that, every push to the production branch redeploys the game.
