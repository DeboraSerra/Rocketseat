FROM golang:1.22.4-alpine AS build
WORKDIR /app

COPY . .
RUN go mod download && go mod verify
RUN go build -o /bin/journey ./cmd/journey/journey.go

FROM scratch

WORKDIR /app
COPY --from=build /bin/journey /bin/journey

EXPOSE 8080

ENTRYPOINT [ "/bin/journey" ]
