const path = require('path');

resolve: {
    extensions: ['.js', '.vue', '.json'],
    alias: {
      '@': path.resolve('src'),
    }
},