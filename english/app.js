var app = new Vue( {
  el: '#app',
  data: {
    wordList: null,
    allowedWords: null,
    difficulty: 0,
    difficultyOptions: [
      { value: 0, text: 'Easy' },
      { value: 1, text: 'Advanced' },
      { value: 2, text: 'Hard' }
    ],
    wordCount: null,
    targetWords: null,
    target: null,
    guess: '',
    error: null,
    history: [],
    solution: null,
    markers: null
  },
  mounted: function () {
    // Load and check word list.
    this.wordList = window.wordList;

    this.wordList = this.wordList.map( entry => [ entry[ 0 ].toLowerCase(), entry[ 1 ] ] );

    this.wordList = this.wordList.filter( entry => {
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

    this.allowedWords = this.wordList.map( entry => entry[ 0 ] );
    this.applyDifficulty();

    // Prepare initial game.
    this.chooseWord();
    this.initializeMarkers();

    // Call checkGuess on Enter.
    this.$refs[ 'guessInput' ].addEventListener( 'keyup', event => {
      if ( event.keyCode === 13 ) {
        event.preventDefault();
        this.checkGuess();
      }
    } );

    // Set focus on text input.
    this.$refs[ 'guessInput' ].focus();
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
     * Apply the difficulty by creating a new targetWords list.
     */
    applyDifficulty: function () {
      var targetWords = this.wordList.filter( entry => entry[ 1 ] <= this.difficulty );
      this.targetWords = targetWords.map( entry => entry[ 0 ] );
      this.wordCount = this.targetWords.length;
    },

    /**
     * Change the difficulty and start a new game.
     */
    changeDifficulty: function () {
      this.applyDifficulty();
      this.newGame();
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
        this.error = { text: guess.toUpperCase(), reason: 'Error: length is not 5.' };
        return;
      }

      if ( this.hasDoubleLetters( guess ) ) {
        this.error = { text: guess.toUpperCase(), reason: 'Error: double letters.' };
        return;
      }

      if ( this.allowedWords.indexOf( guess ) === -1 ) {
        this.error = { text: guess.toUpperCase(), reason: 'Error: unknown word.' };
        return;
      }

      var score = this.matchingLettersCount( this.target, guess );
      this.history.unshift( { text: guess, score: score } );
      this.guess = '';

      if ( this.target === guess ) {
        this.solution = `Correct, the solution is ${ this.target.toUpperCase()}. (${this.history.length} tries)`;
      } else {
        this.$refs[ 'guessInput' ].focus();
      }
    },

    /**
     * Abort game and show solution.
     */
    giveUp: function () {
      this.error = null;
      this.solution = `The solution is ${ this.target.toUpperCase()}.`;
    },

    /**
     * Switch the state of a letter marker.
     */
    switchMarker: function ( letter ) {
      this.markers[ letter ] = ( this.markers[ letter ] + 1 ) % 3;
      this.$refs[ 'guessInput' ].focus();
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
