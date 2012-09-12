all: index.html build

index.html: style.css index.js
%.html: %.jade
	jade -P < $< > $@

%.css: %.styl
	stylus < $< > $@

index.js: build/build.js
	cp build/build.js index.js

LIB_FILES := $(wildcard lib/*.js)

build/build.js: components $(LIB_FILES) puzzle.js ui.js
	component build

components: component.json
	component install --dev
	@touch components

clean:
	rm -fr build components lib-build.js index.html style.css

.PHONY: clean
