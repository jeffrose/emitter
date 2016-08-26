'use strict';

const gulp = require( 'gulp' ),
    babel = require( 'gulp-babel' ),
    benchmark = require( 'gulp-bench' ),
    gutil = require( 'gulp-util' ),
    istanbul = require( 'gulp-istanbul' ),
    jsdoc = require( 'gulp-jsdoc-to-markdown' ),
    mocha = require( 'gulp-mocha' ),
    rename = require( 'gulp-rename' ),
    sourcemaps = require( 'gulp-sourcemaps' ),
    mergeStream = require( 'merge-stream' ),
    
    colors = gutil.colors,
    log = gutil.log;

gulp.task( 'dist', /*[ 'docs' ],*/ () => mergeStream(
    
        // Distribution for modern environments
        gulp.src( [ 'src/emitter.js' ] )
            .pipe( sourcemaps.init() )
            .pipe( sourcemaps.write() )
            .pipe( gulp.dest( 'dist' ) ),
            
        // Distribution for legacy environments
        gulp.src( [ 'src/emitter.js' ] )
            .pipe( sourcemaps.init() )
            .pipe( babel( {
                plugins: [ 'transform-es2015-modules-umd' ],
                presets: [ 'es2015' ]
            } ) )
            //.pipe( uglify() )
            .pipe( rename( 'emitter-umd.js' ) )
            .pipe( sourcemaps.write() )
            .pipe( gulp.dest( 'dist' ) )
    )
);

gulp.task( 'docs', () => {
    return gulp.src( [ 'src/emitter.js' ] )
        .pipe( jsdoc() )
        .on( 'error', ( error ) => {
            log( colors.red( 'jsdoc failed' ), error.message );
        } )
        .pipe( rename( {
            basename: 'API',
            extname: '.md'
        } ) )
        .pipe( gulp.dest( 'docs' ) );
} );

gulp.task( 'test', [ 'dist' ], ( done ) => {
    gulp.src( [ 'dist/emitter-umd.js' ] )
        /*.pipe( sourcemaps.init() )
        .pipe( babel( {
            plugins: [ 'transform-es2015-modules-umd' ],
            presets: [ 'es2015' ]
        } ) )
        .pipe( sourcemaps.write() )*/
        .pipe( istanbul( {
            //instrumenter: Instrumenter
        } ) )
        .pipe( istanbul.hookRequire() )
        .on( 'finish', () => {
            gulp.src( [ 'test/test.js' ], { read: false } )
                .pipe( mocha() )
                .pipe( istanbul.writeReports() )
                .on( 'end', done );
        } );
} );

gulp.task( 'perf', () => {
    return gulp.src( [ 'perf/emit.js' ] )
        .pipe( benchmark() )
        .pipe( gulp.dest( './benchmark' ) );
} );

gulp.task( 'default', [ 'test' ] );