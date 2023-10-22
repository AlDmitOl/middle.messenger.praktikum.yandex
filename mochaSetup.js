import {JSDOM} from 'jsdom';
import constants from './src/constants'

// jsdom
const jsdom = new JSDOM('<body><div id="app"></div></body>',{ url: 'http://localhost/' });

global.window = jsdom.window;
global.document = jsdom.window.document;
global.Node = jsdom.window.Node;
global.MouseEvent = jsdom.window.MouseEvent;
