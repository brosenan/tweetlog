#!/bin/sh

git pull
#../cloudlog1/upload.py app http://192.168.1.5:8080/static
../cloudlog1/upload.py app http://localhost:8080/static
