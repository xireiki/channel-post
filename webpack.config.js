import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export default {
	target: 'node',
	entry: './src/index.js',
	output: {
		path: path.resolve(__dirname, 'dist'),
		filename: 'bundle.js',
		library: {
			type: 'module'
		},
		chunkFormat: 'module'
	},
	mode: 'production',
	optimization: {
		minimize: false
	},
	experiments: {
		outputModule: true
	},
	externalsPresets: {
		node: true
	},
	module: {
		rules: [{
			test: /\.js$/,
			exclude: /node_modules/,
			use: {
				loader: 'babel-loader',
				options: {
					presets: [['@babel/preset-env', { 
						targets: { node: '20' },
						useBuiltIns: false,
						modules: false
					}]]
				}
			}
		}]
	},
	externals: []
};