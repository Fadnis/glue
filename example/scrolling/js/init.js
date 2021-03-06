glue.module.get(
    [
        'glue/game',
        'glue/loader',
        'glue/math/dimension',
        'glue/math/vector',
        'glue/baseobject',
        'glue/component/spritable',
        'glue/component/animatable'
    ],
    function (
        Game,
        Loader,
        Dimension,
        Vector,
        BaseObject,
        Spritable,
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
                    glue: 'glue-logo.png',
                    spil: 'spil-logo.png',
                    dog: 'dog-sit.png'
                }
            }
        }, function () {
            var scroll = Game.getScroll(),
                object = BaseObject(Spritable).add({
                    init: function () {
                        this.spritable.setup({
                            position: Vector(600, 400),
                            image: Loader.getAsset('glue')
                        });
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
                object2 = BaseObject(Spritable).add({
                    init: function () {
                        this.spritable.setup({
                            position: Vector(800, 400),
                            image: Loader.getAsset('spil')
                        });
                    }
                }),
                dog = BaseObject(Animatable).add({
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
                                        startFrame: 0,
                                        endFrame: 7
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
                        this.base.draw(deltaT, context, scroll);
                    }
                });

            Game.add(object);
            Game.add(object2);
            Game.add(dog);
        });
    }
);