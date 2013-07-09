#!/bin/sh
rm -r web
mkdir web
#recess --compile src/less/nacar.less > web/nacar.css
recess --compress src/less/nacar.less > web/nacar.css
jade src/jade/ --out web -P
mkdir web/img
cp src/img/logo.svg web/img/
cp src/img/daisy.png web/img/
cp src/img/daisy-bg.jpg web/img/
cp -r src/img/gallery web/img/

