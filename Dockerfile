# Nginx sert le build Angular produit par le job `angular-build` de la CI.
FROM nginx:alpine

RUN addgroup -g 1001 -S appgroup \
 && adduser -S -u 1001 -G appgroup appuser

# Fichiers applicatifs, propriete de l'utilisateur applicatif
COPY --chown=appuser:appgroup idemat-front/dist/idemat-front/browser /usr/share/nginx/html
COPY --chown=appuser:appgroup nginx.conf /etc/nginx/conf.d/default.conf

RUN sed -i -e '/^[[:space:]]*user[[:space:]]/d' \
           -e '/^[[:space:]]*pid[[:space:]]/d' /etc/nginx/nginx.conf \
 && { echo 'pid /var/run/nginx/nginx.pid;'; cat /etc/nginx/nginx.conf; } > /etc/nginx/nginx.conf.new \
 && mv /etc/nginx/nginx.conf.new /etc/nginx/nginx.conf \
 && mkdir -p /var/run/nginx /var/cache/nginx \
 && chown -R appuser:appgroup /var/run/nginx /var/cache/nginx /var/log/nginx \
                              /etc/nginx/conf.d /usr/share/nginx/html

EXPOSE 8080

USER 1001:1001

CMD ["nginx", "-g", "daemon off;"]
