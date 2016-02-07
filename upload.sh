#!/bin/sh

git pull
../cloudlog1/upload.py app http://localhost:8080/static
