# script for converting raw language resource files

import os

def hasDoubleLetters( word ):
    for i, c in enumerate( word ):
        if ( i != word.rfind( c ) ):
            return True
    return False

def hasNonAlphabetCharacter( word ):
    for c in word:
        if ( not c in 'abcdefghijklmnopqrstuvwxyz' ):
            return True
    return False

count = 0

with open ( 'word-list-raw.txt', 'r' ) as fileHandler:
    with open( 'word-list-converted.js', 'w' ) as outFile:
        outFile.write( 'window.wordList = [' + os.linesep )

        for line in fileHandler:
            word = line.strip()
            word = word.lower()
            if (
                len( word ) == 5 and
                not hasDoubleLetters( word ) and
                not hasNonAlphabetCharacter( word )
            ):
                count += 1
                output = "  [ '" + word + "', 2 ]," + os.linesep
                outFile.write( output )

        outFile.write( '];' + os.linesep )

print( count )
