#!/bin/bash

###############
# ENCODING OGG HELPER
# USAGE: ./fx_encode.sh /path/to/input.wav fx_name fx_number/whatever
###############

if [ $# -ne 3 ] ; then
    echo "Invalid input"
    echo "ENCODING OGG HELPER"
    echo "USAGE: ./fx_encode.sh /path/to/input.wav fx_name fx_number/whatever"
    exit 1
fi

# thank you! - https://stackoverflow.com/questions/59895/can-a-bash-script-tell-which-directory-it-is-stored-in
DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"

# create if no exist
OUT="$DIR/fx/$2"
if [ ! -d $OUT ]; then
    mkdir $OUT
fi
ffmpeg -i "$1" -c:a libopus -b:a 64000 -vbr on -frame_duration 20 "$OUT/$3.ogg"