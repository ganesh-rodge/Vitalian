
            (function (w, d, s, o, f, js, fjs) {
              w["botsonic_widget"] = o;
              w[o] =
                w[o] ||
                function () {
                  (w[o].q = w[o].q || []).push(arguments);
                };
              (js = d.createElement(s)), (fjs = d.getElementsByTagName(s)[0]);
              js.id = o;
              js.src = f;
              js.async = 1;
              fjs.parentNode.insertBefore(js, fjs);
            })(window, document, "script", "Botsonic", "https://widget.botsonic.com/CDN/botsonic.min.js");
            Botsonic("init", {
              serviceBaseUrl: "https://api-azure.botsonic.ai",
              token: "b228c37c-7d55-4f58-8be4-69ce95006943",
            });
         