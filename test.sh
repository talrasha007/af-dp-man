#!/bin/sh

curl 'http://localhost:4321/api/browser' \
  -X POST \
  -u 'api:ZNxBPmhjxGxB' \
  -H 'Content-Type: application/json' \
  --data-raw '{
    "url": "https://aviasales.tpo.lv/1ujTciZK",
    "device": "iPhone 14",
    "click": ".s__z1mqpkFFztsr6PVJ",
    "prefix": "https://aviasales.onelink.me",
    "returnHtml": true,
    "returnHeaders": true   
  }'


# curl 'https://af.web2app.co/api/browser?proxy=http://lianxin.ipweb.cc:7778&proxy-user=S_54295_US___5_87456&proxy-pass=12345678' \
#   -X POST \
#   -u 'api:ZNxBPmhjxGxB' \
#   -H 'Content-Type: application/json' \
#   --data-raw '{
#     "url": "https://aviasales.tpo.lv/1ujTciZK",
#     "click": "div.s__z1mqpkFFztsr6PVJ>a",
#     "click_wait": 5000,
#     "device": "iPhone 14",
#     "ua": "Mozilla/5.0 (iPhone; CPU iPhone OS 18_7 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/18.7 Mobile/15E148 Safari/604.1",
#     "returnHtml": true,
#     "returnHeaders": true
#   }'