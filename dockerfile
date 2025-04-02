FROM alpine:3.21

ARG UGNAME=splatcal

ENV BASE_DIR_WEB=/usr/local/splatcal/web/

RUN addgroup -g 1000 ${UGNAME}
RUN adduser -u 1000 -G ${UGNAME} -s /bin/sh -D ${UGNAME}

RUN apk add apache2

RUN apk add nodejs npm

RUN mkdir -p /usr/local/splatcal/

COPY . /usr/local/splatcal/

RUN chown -R ${UGNAME}:${UGNAME} /usr/local/splatcal

RUN chown -R ${UGNAME}:${UGNAME} /var/log/apache2
RUN chown -R ${UGNAME}:${UGNAME} /usr/lib/apache2
RUN chown -R ${UGNAME}:${UGNAME} /run/apache2

USER ${UGNAME}

COPY ./lib/apache/httpd.conf /etc/apache2/

WORKDIR /usr/local/splatcal/app

RUN npm install --omit=dev

ENTRYPOINT ["/usr/local/splatcal/lib/docker-entrypoint.sh"]

EXPOSE 8080

CMD ["sh"]