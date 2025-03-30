FROM alpine:3.21

ARG UGNAME=splatcal

RUN addgroup -g 1000 ${UGNAME}
RUN adduser -u 1000 -G ${UGNAME} -s /bin/sh -D ${UGNAME}

RUN apk add apache2

RUN apk add nodejs npm

RUN chown -R ${UGNAME}:${UGNAME} /var/log/apache2
RUN chown -R ${UGNAME}:${UGNAME} /usr/lib/apache2
RUN chown -R ${UGNAME}:${UGNAME} /run/apache2

USER ${UGNAME}

RUN mkdir -p /usr/local/splatcal/lib
RUN mkdir -p /usr/local/splatcal/app
RUN mkdir -p /usr/local/splatcal/web

COPY ./lib /usr/local/splatcal/lib/
COPY ./node /usr/local/splatcal/app/
COPY ./web /usr/local/splatcal/web/

COPY ./lib/apache/httpd.conf /etc/apache2/

RUN chown -R ${UGNAME}:${UGNAME} /usr/local/splatcal

WORKDIR /usr/local/splatcal/app

RUN npm install --omit=dev

ENTRYPOINT ["/usr/local/splatcal/lib/docker-entrypoint.sh"]

EXPOSE 8080

CMD ["sh"]