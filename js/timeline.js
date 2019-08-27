class Graph {
    constructor(vertices_count) {
        this.vertices_count = vertices_count;
        this.nodes = new Map();
    }

    addVertex(node, main) {
        this.nodes.set(node, {
            end: null,
            main: main
        });
    }

    addEdge(start, end) {
        this.nodes.get(start).end = end;
    }

};

jQuery(function ($) {
    'use strict';

    const App = {
        init(example) {

            let mainNodeStart = example[0].start;
            let mainNodeEnd = example[0].end;

            let vertices = [];

            let maxOverlap = {
                duration: 0,
                start: 0,
                end: 0
            };

            for (let i = 1; i < example.length; i++) {
                const overlap = this.getOverlap(example[i].start, example[i].end, mainNodeStart, mainNodeEnd);
                if (overlap > maxOverlap.duration && overlap >= 30) {
                    maxOverlap.duration = overlap;
                    maxOverlap.start = example[i].start;
                    maxOverlap.end = example[i].end;
                }
            }

            this.maxOverlap = maxOverlap;

            example = example.sort((a, b) => {
                return a.start - b.start;
            });

            example.forEach((row) => {
                if (vertices.indexOf(row.start) === -1) {
                    vertices.push(row.start);
                }
                if (vertices.indexOf(row.end) === -1) {
                    vertices.push(row.end);
                }
            });

            vertices = vertices.sort((a, b) => {
                return a - b;
            });

            this.myGraph = new Graph(vertices.length);
            for (let i = 0; i < vertices.length; i++) {
                this.myGraph.addVertex(vertices[i], (mainNodeStart == vertices[i]));
            }

            for (let i = 0; i < example.length; i++) {
                this.myGraph.addEdge(example[i].start, example[i].end, i == 0);
            }

            let unvisitedNodes = vertices;
            let set = [];

            while (unvisitedNodes.length !== 0) {

                let result = [];
                let currentNode = unvisitedNodes[0];

                while (currentNode != null) {
                    const node = this.myGraph.nodes.get(currentNode);
                    if (node.end !== null) {
                        result.push({
                            start: currentNode,
                            end: node.end,
                            duration: node.end - currentNode,
                            isBlank: false,
                            main: node.main,
                            overlap: this.isOverlapNode(currentNode, node.end)
                        });
                    }
                    const pos = unvisitedNodes.indexOf(currentNode);
                    unvisitedNodes.splice(pos, 1);

                    currentNode = node.end;

                }
                set.push(result);
            }

            this.tree = set;
            this.cssSet = [];

            this.container = "<div id=\"#id\" class=\"#class\"><b>#content</b></div>";
            this.column_container = "<div id=\"#id\" class=\"column\">";
            this.timeline_container = "<div id=\"#id\" class=\"#class\">#content</div>";

            this.renderTimeline();
            this.render();
            this.applyCss();
        },

        getOverlap(a, b, c, d) {
            let result = -1;
            if (!(b <= c || a >= d)) {
                result = Math.abs(b - a);
                result = (Math.abs(b - c) < result) ? Math.abs(b - c) : result;
                result = (Math.abs(d - c) < result) ? Math.abs(d - c) : result;
                result = (Math.abs(d - a) < result) ? Math.abs(d - a) : result;
            }
            return result;
        },

        isOverlapNode(s, e) {
            if (s == this.maxOverlap.start && e == this.maxOverlap.end) {
                return true;
            }
            return false;
        },

        renderTimeline() {
            let result = [];
            let counter = 8;

            for (let i = 0; i < 720; i += 30) {
                const isHr = i % 60 == 0;
                if (i % 60 == 0) {
                    counter++;
                }
                let content = this.timeline_container;
                const hhmm = counter.toString() + ((isHr) ? " : 00" : " : 30");
                const myClass = (isHr) ? "full_hr" : "half_hr";
                content = content.replace('#content', hhmm);
                content = content.replace('#class', myClass);
                content = content.replace('#id', counter.toString() + ((isHr) ? "00" : "30"));
                result.push(content);
            }

            $('#timeline').html(result);
        },

        render() {
            let result = [];


            this.tree.forEach((col, colId) => {
                result.push(this.renderColumn(col, colId));
            });

            $('#container').html(result);
        },

        renderColumn(colArr, colIx) {
            let result = this.column_container.replace('#id', colIx);
            result += this.renderContainer({
                start: 0,
                end: colArr[0].start,
                main: false,
                isBlank: true,
                overlap: false,
            }, colIx, 0);

            colArr.forEach((row, ix) => {
                result += this.renderContainer(row, colIx, ix + 1);
            });

            result += "</div>";

            return result;
        },

        renderContainer(row, colIx, rowIx) {
            let result = null;
            let myContainer = this.container;
            let type = row.isBlank ? 'blank' : (row.main) ? 'main' : 'container';
            let id = colIx + '_' + rowIx + '_' + type;

            if (row.isBlank) {
                result = myContainer.replace('#id', id);
                result = result.replace('#content', '<br/>');
                result = result.replace('#class', 'blank_container');
            } else {
                result = myContainer.replace('#id', id);
                if (row.main) {
                    if (this.maxOverlap.duration === 0) {
                        result = result.replace('#class', 'no_overlap');
                    } else {
                        result = result.replace('#class', 'main_meeting');
                    }
                    result = result.replace('#content', 'Me');
                } else if (row.overlap) {
                    result = result.replace('#content', 'Meeting');
                    result = result.replace('#class', 'main_meeting');
                } else {
                    result = result.replace('#content', 'Meeting');
                    result = result.replace('#class', 'meeting');
                }
            }
            this.cssSet['#' + id] = row.end - row.start;
            return result;
        },


        applyCss() {

            // Columns
            const count = this.tree.length;
            const w = $('#container').width();
            $('.column').width(w / count);

            // Containers Heights
            const ids = Object.keys(this.cssSet);
            ids.forEach((id) => {
                $(id).height(this.cssSet[id]);
            });
        }
    };

    $(document).ready(() => {
        let example = [{
            start: 225,
            end: 285
        }, {
            start: 210,
            end: 270
        }, {
            start: 180,
            end: 240
        }, {
            start: 240,
            end: 300
        }, {
            start: 300,
            end: 360
        }, {
            start: 270,
            end: 330
        }];

        let example2 = [{
            start: 225,
            end: 285
        }, {
            start: 300,
            end: 360
        }, {
            start: 180,
            end: 240
        }];

        App.init(example);

        window.matchLunchEvent = (example) => {
            App.init(example);
        };
    });
});
