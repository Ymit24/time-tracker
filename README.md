# Time Tracker (Vite + React)

This app is a static frontend that stores data in browser `localStorage`.

## Local Development

```bash
npm install
npm run dev
```

## Docker (Caddy Runtime)

Build and run directly:

```bash
docker build -t time-tracker-opus46 .
docker run --rm -p 8080:80 time-tracker-opus46
```

Open `http://localhost:8080`.

Compose file for Dockploy:

```bash
docker compose up --build -d
```

## Deploy on Dockploy

1. Push this repository to your Git provider.
2. In Dockploy, create a new application from the repository.
3. Choose Docker Compose deployment and select `docker-compose.yml`.
4. In the app's Domains section, add your domain (Dockploy/Traefik handles routing and TLS).
5. Deploy the app.
6. Verify the domain loads the app.
7. Verify refreshing a client-side route does not return 404.

## Notes

- The container serves on port `80`.
- Runtime server is `caddy`.
- `docker-compose.yml` uses `expose: 80` (no host port binding), which avoids conflicts with Dockploy/Traefik on VM.
- App data is stored in each user's browser (`localStorage`), not on the server.
