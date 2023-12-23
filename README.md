Poly wasm task

## Build
Requires Docker and docker-compose
```shell
nvm use 20 && yarn build
```

## Test

In one process:
```shell
nvm use 20 && yarn start
```

In another process:
```shell
nvm use 20 && yarn test
```