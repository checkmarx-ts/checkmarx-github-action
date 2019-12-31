FROM openjdk:11.0.5

LABEL Miguel Freitas <miguel.freitas@checkmarx.com>

COPY entrypoint.sh /entrypoint.sh

RUN chmod +x /entrypoint.sh

ENTRYPOINT ["/entrypoint.sh"]