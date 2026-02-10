Creditos "yoelbulo"
no es muy dificil, solo ejecuta. Si tenes preguntas buscame en el juego




javascript:
(function() {
    /* 1. Detección de Coordenadas de Destino */
    var tx, ty;
    var unitSpeed = 1.02;
    
    var headerText = $("#content_value h2").text();
    var infoTableText = $(".vis").text();
    
    var allPageText = headerText + " " + infoTableText;
    var match = allPageText.match(/(\d{1,3})\|(\d{1,3})/);

    if (match) {
        tx = parseInt(match[1]);
        ty = parseInt(match[2]);
    } else {
        var coordElem = $('#info_village tr:contains("Coordenadas") td:last-child').text() || $('.village_anchor').first().text();
        var match2 = coordElem.match(/(\d{1,3})\|(\d{1,3})/);
        if (match2) { tx = parseInt(match2[1]); ty = parseInt(match2[2]); }
    }

    if (!tx) {
        UI.InfoMessage('Error: No se encontró la coordenada en pantalla.', 3000, 'error');
        return;
    }

    /* 2. Obtener lista de tus pueblos */
    UI.InfoMessage('Calculor distancias yoelbulo (W96)...', 1000);

    $.get(window.location.origin + '/game.php?screen=overview_villages&mode=combined', function(data) {
        var villages = [];
        $(data).find('#combined_table tr.nowrap').each(function() {
            var row = $(this);
            var c = row.find('.quickedit-vn').text().match(/(\d+)\|(\d+)/);
            if (c) {
                villages.push({
                    name: row.find('.quickedit-label').text().trim(),
                    x: parseInt(c[1]),
                    y: parseInt(c[2])
                });
            }
        });

        if (villages.length === 0) {
            UI.InfoMessage('No pude leer tus pueblos.', 3000, 'error');
            return;
        }

        /* 3. Cálculo de Tiempos con factor 1.02 */
        function t(d, s) {
            // Fórmula: (Distancia * MinutosBase) / VelocidadUnidad
            var mTotal = d * (s / unitSpeed);
            var h = Math.floor(mTotal / 60);
            var m = Math.floor(mTotal % 60);
            var seg = Math.round((mTotal * 60) % 60);
            return h + "h " + ("0" + m).slice(-2) + "m " + ("0" + seg).slice(-2) + "s";
        }

        var rows = villages.map(v => {
            var d = Math.sqrt(Math.pow(v.x - tx, 2) + Math.pow(v.y - ty, 2));
            return { n: v.name, x: v.x, y: v.y, d: d };
        }).sort((a, b) => a.d - b.d);

        /* 4. Mostrar Resultados */
        var h = '<div style="padding:10px; background:#f4e4bc; max-height:400px; overflow-y:auto;">';
        h += '<h3>Destino: ' + tx + '|' + ty + ' (Vel: 1.02)</h3>';
        h += '<table class="vis" style="width:100%">';
        h += '<tr style="background:#c1a264"><th>Origen</th><th>Dist.</th><th>Pala</th><th>Hacha</th><th>Ariete</th><th>Noble</th></tr>';
        
        rows.forEach(r => {
            h += `<tr>
                <td style="font-size:10px">${r.n}</td>
                <td>${r.d.toFixed(1)}</td>
                <td>${t(r.d, 10)}</td>
                <td>${t(r.d, 18)}</td>
                <td>${t(r.d, 30)}</td>
                <td style="font-weight:bold; color:red">${t(r.d, 35)}</td>
            </tr>`;
        });
        h += '</table></div>';
        Dialog.show("distancias_final", h);
    });

})();
