var alert_window;

function alert_setup() {
    jsh.select("#jsh_alert_container").js.setAttribute("data-html2canvas-ignore", "true");
    jsh.select("#nav").js.setAttribute("data-html2canvas-ignore", "true");
    alert_window = jsh.select("#jsh_alert_window").js;

    jsh.select("#jsh_alert_window").js.addEventListener("mousedown", function(e) {
        var init_mouse_x = e.pageX;
        var init_mouse_y = e.pageY;
        var init_window_x = alert_window.style.left == "" ? 0 : parseInt(alert_window.style.left);
        var init_window_y = alert_window.style.top == "" ? 0 : parseInt(alert_window.style.top);

        var left_bound = ((window.innerWidth - jsh.select("#jsh_alert_window").js.clientWidth) / 2);
        var upper_bound = ((window.innerHeight - jsh.select("#jsh_alert_window").js.clientHeight) / 2);

        var listener = function(e) {
            var dx = init_mouse_x - e.pageX;
            var dy = init_mouse_y - e.pageY;

            alert_window.style.left = Math.min(Math.max(-left_bound, (init_window_x - dx)), left_bound) + "px";
            alert_window.style.top = Math.min(Math.max(-upper_bound + 40, (init_window_y - dy)), upper_bound) + "px";

            update_alert_pos();
        };

        window.addEventListener("mousemove", listener);

        var clear_listeners = function() {
            window.removeEventListener("mousemove", listener);
            window.removeEventListener("mouseup", clear_listeners);
        };

        window.addEventListener("mouseup", clear_listeners);
    });

    var scroll_alert_window_bounds = alert_window.getBoundingClientRect();
    var update_scroll_alert_window_bounds = true;
    window.addEventListener("scroll", function() {
        if (update_scroll_alert_window_bounds) {
            scroll_alert_window_bounds = alert_window.getBoundingClientRect();
            update_scroll_alert_window_bounds = false;
            setTimeout(function() {
                update_scroll_alert_window_bounds = true;
            }, 500);
        }

        update_alert_pos(scroll_alert_window_bounds);
    });
}

function alert(message, title, args) {
    args = args == undefined ? {} : args;

    args.button_callback = (args.button_callback == undefined) ? function() {close_alert();} : args.button_callback;
    args.cancel_callback = (args.cancel_callback == undefined) ? function() {close_alert();} : args.cancel_callback;

    jsh.alert.open(message, title, args);

    update_alert_bg();
}

function close_alert() {
    setTimeout(function() {
        alert_window.style.left = alert_window.style.top = "0px";
    }, 500);

    jsh.alert.close();
}

var refresh_render_timeout;
window.addEventListener("resize", function() {
    update_alert_pos();
    clearTimeout(refresh_render_timeout);
    refresh_render_timeout = setTimeout(update_alert_bg, 500);
});

function update_alert_bg() {
    html2canvas(document.body, {async: true}).then(function(canvas) {
        stackBoxBlurCanvasRGBA(canvas, 0, 0, canvas.width, canvas.height, 10, 2);
        alert_window.style.backgroundImage = "url('" + canvas.toDataURL() + "')";
        update_alert_pos();
    });
}

function update_alert_pos(bounds) {
    bounds = bounds == undefined ? alert_window.getBoundingClientRect() : bounds;
    alert_window.style.backgroundPosition = (-bounds.left - window.scrollX) + "px " + (-bounds.top - window.scrollY) + "px";
}
