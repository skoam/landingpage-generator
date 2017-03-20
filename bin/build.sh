#!/bin/bash

function minify {
  sh packJS.sh $1
}

EXTENSION_PATH="../views/js/extensions/"
cd $EXTENSION_PATH

cd detail
echo "Entering $(pwd).."
minify extension
cd ..
cd base
echo "Entering $(pwd).."
minify extension
