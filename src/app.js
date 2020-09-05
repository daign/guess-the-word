var app = new Vue( {
  el: '#app',
  data: {
    targetWords: null,
    allowedWords: null,
    target: null,
    guess: '',
    error: null,
    history: [],
    solution: null,
    markers: null
  },
  mounted: function () {
    // Load and check word list.
    var wordList = window.wordList;

    wordList = wordList.map( entry => [ entry[ 0 ].toLowerCase(), entry[ 1 ] ] );

    wordList = wordList.filter( entry => {
      if ( entry[ 0 ].length !== 5 ) {
        console.log( `removed ${entry[ 0 ].toUpperCase()} from word list because of wrong length` );
        return false;
      } else if ( this.hasDoubleLetters( entry[ 0 ] ) ) {
        console.log( `removed ${entry[ 0 ].toUpperCase()} from word list because of duplicated letters` );
        return false;
      } else {
        return true;
      }
    } );

    var difficulty = 5;
    var targetWords = wordList.filter( entry => entry[ 1 ] <= difficulty );
    this.targetWords = targetWords.map( entry => entry[ 0 ] );
    this.allowedWords = wordList.map( entry => entry[ 0 ] );

    // Prepare initial game.
    this.chooseWord();
    this.initializeMarkers();
  },
  methods: {
    /**
     * Setup a new game.
     */
    newGame: function () {
      this.guess = '';
      this.error = null;
      this.history = [];
      this.solution = null;

      this.chooseWord();
      this.initializeMarkers();
    },

    /**
     * Choose the secret word.
     */
    chooseWord: function () {
      var count = this.targetWords.length;
      var random = Math.floor( Math.random() * count );
      this.target = this.targetWords[ random ];
    },

    /**
     * Initialize array to save the marker state for each letter.
     */
    initializeMarkers: function () {
      var keys = 'abcdefghijklmnopqrstuvwxyz'.split( '' );
      var markers = keys.map( c => [ c, 0 ] );
      this.markers = Object.fromEntries( markers );
    },

    /**
     * Check the user input.
     */
    checkGuess: function () {
      this.error = null;

      var guess = this.guess.toLowerCase();

      if ( guess.length !== 5 ) {
        this.error = { text: guess.toUpperCase(), reason: 'Fehler: Länge ist nicht 5.' };
        return;
      }

      if ( this.hasDoubleLetters( guess ) ) {
        this.error = { text: guess.toUpperCase(), reason: 'Fehler: Doppelte Buchstaben.' };
        return;
      }

      if ( this.allowedWords.indexOf( guess ) === -1 ) {
        this.error = { text: guess.toUpperCase(), reason: 'Fehler: Unbekanntes Wort.' };
        return;
      }

      var score = this.matchingLettersCount( this.target, guess );
      this.history.unshift( { text: guess, score: score } );
      this.guess = '';

      if ( this.target === guess ) {
        this.solution = `Richtig, die Lösung ist ${ this.target.toUpperCase()}. (${this.history.length} Versuche)`;
      }
    },

    /**
     * Abort game and show solution.
     */
    giveUp: function () {
      this.error = null;
      this.solution = `Die Lösung ist ${ this.target.toUpperCase()}.`;
    },

    /**
     * Switch the state of a letter marker.
     */
    switchMarker: function ( letter ) {
      this.markers[ letter ] = ( this.markers[ letter ] + 1 ) % 3;
    },

    /**
     * Check if word uses a letter twice.
     */
    hasDoubleLetters: function ( word ) {
      var chars = word.split( '' );
      return chars.some( function( char, index, array ) {
        return array.lastIndexOf( char ) != index;
      } );
    },

    /**
     * Return the number of matching letters from both words.
     */
    matchingLettersCount: function ( target, guess ) {
      var score = 0;
      var chars = [ ...target.split( '' ), ...guess.split( '' ) ];
      chars.sort();
      for ( var i = 0; i < chars.length - 1; i++ ) {
        score += ( chars[ i ] === chars[ i + 1 ] );
      }
      return score;
    }
  }
} );
