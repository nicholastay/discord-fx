*.dca preprocessed files go here, in folders with whatever you want the trigger to be and inside whatever filename.dca

instructions to how to create these *.dca files can be found here: https://github.com/bwmarrin/dca/tree/master/cmd/dca
probably just follow the instructions
i used linux
i needed to `go get github.com/layeh/gopus` first though
and then go into the dca/cmd/dca and `go build` then you get the executable

then pipe to output, so `dca -i /file.wav > file.dca`