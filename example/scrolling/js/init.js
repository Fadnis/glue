glue.module.get(
    [
        'glue/game',
        'glue/loader',
        'glue/math/dimension',
        'glue/math/vector',
        'glue/baseobject',
        'glue/component/visible',
        'glue/component/animatable'
    ],
    function (
        Game,
        Loader,
        Dimension,
        Vector,
        BaseObject,
        Visible,
        Animatable
    ) {
        'use strict';

        Game.setup({
            game: {
                name: 'Scrolling'
            },
            canvas: {
                id: 'canvas',
                dimension: Dimension(800, 600)
            },
            develop: {
                debug: true
            },
            asset: {
                path: '../',
                image: {
                    source: {
                        glue: 'glue-logo.png',
                        spil: 'spil-logo.png',
                        dog: 'dog-sit.png'
                    }
                }
            }
        }, function () {
            var scroll = Game.getScroll(),
                object = BaseObject(Visible).add({
                    init: function () {
                        this.visible.setup({
                            position: Vector(600, 400),
                            image: Loader.getAsset('glue')
                        });
                    },
                    draw: function (deltaT, context, scroll) {
                        this.visible.draw(deltaT, context, scroll);
                    },
                    pointerMove: function (e) {
                        var position = Vector(
                            Math.round(e.position.x),
                            Math.round(e.position.y)
                        );
                        scroll.x = position.x;
                        scroll.y = position.y;
                    }
                }),
                object2 = BaseObject(Visible).add({
                    init: function () {
                        this.visible.setup({
                            position: Vector(800, 400),
                            image: Loader.getAsset('spil')
                        });
                    },
                    draw: function (deltaT, context, scroll) {
                        this.visible.draw(deltaT, context, scroll);
                    }
                }),
                dog = BaseObject(Visible, Animatable).add({
                    init: function () {
                        this.animatable.setup({
                            position: {
                                x: 350,
                                y: 400
                            },
                            image: Loader.getAsset('dog'),
                            animation: {
                                frameCount: 8,
                                fps: 8,
                                animations: {
                                    wiggleTail: {
                                        startFrame: 1,
                                        endFrame: 8
                                    }
                                }
                            }
                        });
                        this.animatable.setAnimation('wiggleTail');
                    },
                    update: function (deltaT, context) {
                        this.animatable.update(deltaT);
                    },
                    draw: function (deltaT, context, scroll) {
                        this.animatable.draw(deltaT, context, scroll);
                    }
                });

            Game.add(object);
            Game.add(object2);
            Game.add(dog);
        });
    }
);