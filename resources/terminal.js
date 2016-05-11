var terminal = {
    setup: function() {
        var terminal_container = document.createElement("div");
        terminal_container.innerHTML = terminal.html;
        jsh.select("#content").js.appendChild(terminal_container);

        terminal.container_div = jsh.select("#terminal_container");
        terminal.input_prefix_div = jsh.select("#terminal_input_prefix");
        terminal.history_div = jsh.select("#terminal_history");
        terminal.scroll_div = jsh.select("#terminal_scroll");
        terminal.command_down = false;
        terminal.python_mode = false;

        Sk.configure({output:terminal.output, retainglobals: true});

        jsh.select("#terminal_title").js.addEventListener("mousedown", function(e) {
            var terminal_window = jsh.select("#terminal_window").js;

            var init_mouse_x = e.pageX;
            var init_mouse_y = e.pageY;
            var init_window_x = terminal_window.style.left == "" ? 0 : parseInt(terminal_window.style.left);
            var init_window_y = terminal_window.style.top == "" ? 0 : parseInt(terminal_window.style.top);

            var listener = function(e) {
                var dx = init_mouse_x - e.pageX;
                var dy = init_mouse_y - e.pageY;

                terminal_window.style.left = (init_window_x - dx) + "px";
                terminal_window.style.top = (init_window_y - dy) + "px";
            };

            window.addEventListener("mousemove", listener);

            var clear_listeners = function() {
                window.removeEventListener("mousemove", listener);
                window.removeEventListener("mouseup", clear_listeners);
            };

            window.addEventListener("mouseup", clear_listeners);
        });

        jsh.select("#terminal_resize_bottom_right").js.addEventListener("mousedown", function(e) {
            var terminal_window = jsh.select("#terminal_window").js;

            var init_mouse_x = e.pageX;
            var init_mouse_y = e.pageY;
            var init_window_x = terminal_window.style.left == "" ? 0 : parseInt(terminal_window.style.left);
            var init_window_y = terminal_window.style.top == "" ? 0 : parseInt(terminal_window.style.top);
            var init_window_width = terminal_window.style.width == "" ? 500 : parseInt(terminal_window.style.width);
            var init_window_height = terminal_window.style.height == "" ? 300 : parseInt(terminal_window.style.height);

            var listener = function(e) {
                var dx = init_mouse_x - e.pageX;
                var dy = init_mouse_y - e.pageY;

                if ((init_window_width - dx) > 200) {
                    terminal_window.style.left = init_window_x - (dx / 2) + "px";
                    terminal_window.style.width = (init_window_width - dx) + "px";
                }

                if ((init_window_height - dy) > 100) {
                    terminal_window.style.top = init_window_y - (dy / 2) + "px";
                    terminal_window.style.height = (init_window_height - dy) + "px";
                }
            };

            window.addEventListener("mousemove", listener);

            var clear_listeners = function() {
                window.removeEventListener("mousemove", listener);
                window.removeEventListener("mouseup", clear_listeners);
            };

            window.addEventListener("mouseup", clear_listeners);
        });

        jsh.select("#terminal_absolute").js.addEventListener("click", function() {
            jsh.select("#terminal_input_field").js.select();
        });

        jsh.select("#terminal_input_field").js.addEventListener("keypress", function(e) {
            if (e.keyCode == 13) {
                terminal.parse_input(e.target.value);
                e.target.value = "";
            } else if(e.keyCode == 107 && terminal.command_down){
                terminal.history_div.js.innerHTML = "";
                e.target.value = "";
            }
        });

        jsh.select("#terminal_input_field").js.addEventListener("keydown", function(e) {
            if (e.keyCode == 91|| e.keyCode == 93) {
                terminal.command_down = true;
            }
        });

        jsh.select("#terminal_input_field").js.addEventListener("keyup", function(e) {
            if (e.keyCode == 91 || e.keyCode == 93) {
                terminal.command_down = false;
            }
        });

        jsh.select("#terminal_exit").js.addEventListener("click", terminal.close);

        if ("onhashchange" in window) {
            window.addEventListener("hashchange", on_hash_change);
        }
    },

    open: function() {
        terminal.container_div.remove_class("display_none");
        terminal.container_div.remove_class("transparent");
    },

    close: function() {
        terminal.container_div.add_class("transparent");
        setTimeout(function() {
            terminal.container_div.add_class("display_none");
        }, 500);
    },

    parse_input: function(input) {
        if (!terminal.python_mode) {
            terminal.output("<br>" + terminal.input_prefix_div.js.innerText + " " + input);

            input = input.split(" ");
            var command = input[0];
            var args = input.slice(1);

            if (command == "ls") {
                terminal.output("\nsome_file.txt");
            } else if (command == "python") {
                terminal.output('\nPython 2.7.6 (v2.7.6:3a1db0d2747e, Nov 10 2013, 00:42:54) \n\
                [GCC 4.2.1 (Apple Inc. build 5666) (dot 3)] on darwin\n\
                Type "help", "copyright", "credits" or "license" for more information.\n');

                terminal.set_prefix(">>> ");
                terminal.python_mode = true;
            } else {
                terminal.output("\n-bash: " + command + ": command not found");
            }
        } else {
            terminal.output(terminal.input_prefix_div.js.innerText + " " + input);

            if (input == "exit()") {
                terminal.python_mode = false;
                terminal.set_prefix("joshua.diaddigo.com:~ guest$ ");
            } else {
                terminal.output("<br>");
                terminal.interpret_python(input);
            }
        }
    },

    interpret_python: function(code) {
        Sk.misceval.asyncToPromise(function() {
            return Sk.importMainWithBody("<stdin>", false, code, true);
        }).then(function(mod) {
            terminal.mod = mod;
        }, function(err) {
            terminal.output(err.toString() + "\n");
        });
    },

    output: function(output) {
        var history = terminal.history_div.js;
        output = output.split("\n").join("<br>");
        history.innerHTML = history.innerHTML.replace(/^<br>+/gm,'') + output;
        terminal.scroll_div.js.scrollTop = 99999999;
    },

    set_prefix: function(terminal_input_prefix) {
        terminal.input_prefix_div.js.innerText = terminal_input_prefix;
        terminal.input_prefix_div.js.style.width = ((terminal_input_prefix.length) * 7.25) + "px";
    },

    html: ' <div id="terminal_container" class="transparent display_none">\
                <div id="terminal_window">\
                    <div id="terminal_absolute">\
                        <div id="terminal_ui">\
                            <div id="terminal_title">guest – bash</div>\
                            <div id="terminal_exit" class="terminal_button"></div>\
                            <div id="terminal_minimize" class="terminal_button"></div>\
                            <div id="terminal_fullscreen" class="terminal_button"></div>\
                        </div>\
                        <div id="terminal_scroll">\
                            <div id="terminal_content">\
                                <div id="terminal_history">\
                                    Last login: Tue May 10 19:03:26 on ttys002\
                                </div>\
                                <div id="terminal_input">\
                                    <table id="terminal_input_table">\
                                        <tr>\
                                            <td id="terminal_input_prefix">\
                                                joshua.diaddigo.com:~ guest$ \
                                            </td>\
                                            <td>\
                                                <input id="terminal_input_field" autocomplete="off"/>\
                                            </td>\
                                        </tr>\
                                    </table>\
                                </div>\
                            </div>\
                        </div>\
                        <div id="terminal_resize_bottom_right"></div>\
                    </div>\
                </div>\
            </div>'
};
