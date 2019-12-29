#!/bin/bash

SOURCE="$TRAVIS_BUILD_DIR/dist/"
WWW_ROOT="/var/www"
USERNAME="ttk91web"
HOSTNAME="karhusaari.me"

_deploy() {
  echo rsync --delete -avz -e "ssh -o StrictHostKeyChecking=no" \
    "$SOURCE" \
    "$USERNAME@$HOSTNAME:$WWW_ROOT/$1"
}

case "$1" in
  production)
    _deploy "ttk91web"
    ;;
  staging)
    _deploy "ttk91web-staging"
    ;;
esac
