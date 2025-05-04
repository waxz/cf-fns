---
title: How to generate keys from Cloudflare to make free SSL in Nginx
---



- [Cloudflare origin CA](https://developers.cloudflare.com/ssl/origin-configuration/origin-ca/)
- [How to generate keys from Cloudflare to make free SSL in Nginx](https://grassrootengineer.medium.com/how-to-generate-keys-from-cloudflare-to-make-free-ssl-in-nginx-3cd950062440)

# use cloudflare

# using openssl generate

```bash
mkdir cert

cat << EOF | tee cert/wrangler_cert.conf
# content of cert/wrangler_cert.conf
[ req ]
default_bits = 2048
default_md = sha256
distinguished_name = req_distinguished_name
x509_extensions = v3_ca
prompt = no

[ req_distinguished_name ]
C = EN
CN = Wrangler Debug Certificate

[ v3_ca ]
basicConstraints = critical,CA:TRUE
keyUsage = critical,keyCertSign,cRLSign,digitalSignature,keyEncipherment
extendedKeyUsage = serverAuth,clientAuth
subjectKeyIdentifier = hash
authorityKeyIdentifier = keyid:always,issuer
EOF

openssl genpkey -algorithm RSA -pkeyopt rsa_keygen_bits:2048 -out cert/private.pem
openssl req -x509 -new -sha256 -days 21900 -key cert/private.pem -config cert/wrangler_cert.conf -out cert/certificate.pem

```



# run wrangler dev
```bash
export ssl_certificate_key=./cert/private.pem
export ssl_certificate=./cert/certificate.pem
# sudo chown -R $USER:$USER $ssl_certificate_key
# sudo chown -R $USER:$USER $ssl_certificate

# npx wrangler pages dev --local-protocol https --https-key-path $ssl_certificate_key --https-cert-path $ssl_certificate --port 8888 --ip 0.0.0.0
# run with https, raise error: ✘ [ERROR] kj/compat/tls.c++:535: error: error accepting tls connection; kj::mv(e) = kj/compat/tls.c++:82: failed: OpenSSL error; message = error:1000009c:SSL routines:OPENSSL_internal:HTTP_REQUEST; clientId = 127.0.0.1:60812

npx wrangler pages dev --local-protocol http --https-key-path $ssl_certificate_key --https-cert-path $ssl_certificate --port 8888 --ip 0.0.0.0

```
then you can visit [https://localhost:8888](https://localhost:8888)
