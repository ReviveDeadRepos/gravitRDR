## Introduction

GravitRDR is a non-commercial community fork of the original Gravit design tool, originally created for Mac, Windows, Linux, ChromeOS, and browsers. Gravit was built in the spirit of Freehand and Fireworks, fully written in HTML5, JavaScript, and CSS3. The original project consisted of the core engine called "Infinity", the actual Application, and the core Module called "Gravit".

This fork is maintained independently by the ReviveDeadRepos community and is **not affiliated with, endorsed by, or sponsored by Quasado, Quasado e.K., or Corel**.

We encourage everyone to get involved with this project. You can develop new features, fix tickets, or help improve the UI and icons. To get started contributing, read the [GitHub Guide](https://guides.github.com/activities/contributing-to-open-source/).

## Prerequisites

* NodeJS + NPM  
* Grunt Client  
* Bower  
* SASS + Compass  

## Quick Start

Install all prerequisites and ensure they are available on your PATH.

Then run `npm install` to install all Node.js dependencies.  
Then run `bower install` to install all client JavaScript libraries.

Finally, run `grunt`. You can then open GravitRDR in your web browser at http://127.0.0.1:8999/.

We recommend using Chrome, as it is also used for the standalone version.

## Quick Overview

+ assets - contains all relevant assets like fonts, images, etc.  
+ shell - contains platform-specific code for standalone version  
+ src - contains all source code  
  + application - contains the application framework  
  + development - contains the development addon automatically loaded when developing  
  + gravit - contains the core module loaded by the application and provides all UI of GravitRDR  
  + infinity - contains the core rendering engine as well as core classes used elsewhere  
  + infinity-editor - contains editors, tools, guides, and more based on infinity  
+ style - contains all styling files for the application  
+ test - contains all test files  

## Community

Issues are tracked here on GitHub.

## License and Trademark Notice

This project is a non-commercial fork of the original Gravit project by Quasado.  
The original code is licensed under the GNU General Public License (GPL) version 3 or later.  
You must comply with the GPL when using or redistributing this code.

The names "Gravit", the Gravit Logo, and all related trademarks are the exclusive property of Quasado GmbH, Quasado e.K., and Corel, and are **not used in this project**. 
All original branding has been removed or replaced.

All original trademarks and branding have been removed or replaced in this fork.

This project is **not affiliated with, endorsed by, or sponsored by Quasado, Quasado e.K., or Corel**.
