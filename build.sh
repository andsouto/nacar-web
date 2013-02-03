#!/bin/sh
rm -r web
mkdir web
recess --compile src/less/nacar.less > build/nacar.css
jade src/jade/ --out web -P
mkdir build/img
cp src/img/logo.svg web/img/
