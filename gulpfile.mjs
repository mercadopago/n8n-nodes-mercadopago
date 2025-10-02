// gulpfile.mjs
import gulp from 'gulp';

const paths = {
  icons: {
    src: 'src/resources/icons/**/*.*',
    dest: 'dist/resources/icons',
  },
  nodeSvgs: {
    src: 'src/nodes/**/*.svg',
    dest: 'dist/nodes',
  },
};

function copyIcons() {
  return gulp.src(paths.icons.src).pipe(gulp.dest(paths.icons.dest));
}

function copyNodeSvgs() {
  return gulp.src(paths.nodeSvgs.src).pipe(gulp.dest(paths.nodeSvgs.dest));
}

// Definir y exportar la tarea build:icons
export const buildIcons = gulp.series(copyIcons, copyNodeSvgs);

// Registrar la tarea con el nombre correcto
gulp.task('build:icons', buildIcons);
