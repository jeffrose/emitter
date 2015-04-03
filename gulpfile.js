'use strict';

var gulp = require( 'gulp' ),
    babel = require( 'gulp-babel' ),
    isparta = require( 'isparta' ),
    istanbul = require( 'gulp-istanbul' ),
    mocha = require( 'gulp-mocha' ),
    rename = require( 'gulp-rename' );

gulp.task( 'dist', function(){
    return gulp.src( [ 'src/index.js' ] )
        .pipe( babel( {
            modules: 'umd'
        } ) )
        .pipe( rename( 'ee.js' ) )
        .pipe( gulp.dest( 'dist' ) );
} );

gulp.task( 'test', function( done ){
    gulp.src( [ 'src/index.js' ] )
        .pipe( istanbul( {
            instrumenter: isparta.Instrumenter
        } ) )
        .pipe( istanbul.hookRequire() )
        .on( 'finish', function(){
            gulp.src( [ 'test/*.js' ] )
                .pipe( mocha( {
                    compilers: 'js:babel'
                } ) )
                .pipe( istanbul.writeReports() )
                .on( 'end', done );
        } );
} );

gulp.task( 'default', [ 'test' ] );