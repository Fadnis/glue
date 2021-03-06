glue.module.get(
    [
        'glue/game',
        'glue/loader',
        'glue/math/dimension',
        'glue/component/spritable',
        'glue/component/kineticable',
        'glue/component/draggable',
        'glue/sat',
        'glue/baseobject',
        'glue/math',
        'glue/math/vector'
    ],
    function (
        Game,
        Loader,
        Dimension,
        Spritable,
        Kineticable,
        Draggable,
        SAT,
        BaseObject,
        Mathematics,
        Vector
    ) {
        'use strict';

        Game.setup({
            game: {
                name: 'Group VS Group'
            },
            canvas: {
                id: 'canvas',
                dimension: Dimension(800, 600)
            },
            develop: {
                debug: true
            },
            asset: {
                path: 'asset/',
                image: {
                    ball: 'ball.png',
                    ball2: 'ball2.png',
                    logo: 'glue.png'
                }
            }
        }, function () {
            var math = Mathematics(),
                collisionType = SAT.CIRCLE_TO_CIRCLE,//SAT.RECTANGLE_TO_RECTANGLE,
                group1 = [],
                group2 = [],
                i,
                logo = BaseObject(Spritable, Kineticable, Draggable).add({
                    init: function () {
                        this.spritable.setup({
                            position: {
                                x: 400,
                                y: 300
                            },
                            image: Loader.getAsset('logo')
                        });
                        this.kineticable.setup({
                            dynamic: false
                        });
                    },
                    update: function (deltaT) {
                        this.base.update(deltaT);
                        SAT.collideGroup(this, group1, collisionType);
                        SAT.collideGroup(this, group2, collisionType);
                    }
                });
        
            Game.add(logo);

            for (i = 0; i < 20; ++i) {
                var obj1 = BaseObject(Spritable, Kineticable).add({
                        init: function () {
                            // spritable config
                            this.spritable.setup({
                                position: {
                                    x: math.random(0, Game.canvas.getDimension().width - 25),
                                    y: 0
                                },
                                image: Loader.getAsset('ball')
                            });

                            // kineticable config
                            this.kineticable.setup({
                                gravity: Vector(0, 0.5),
                                bounce: 0.6,
                                velocity: Vector(math.random(-10, 10), 0),
                                maxVelocity: Vector(0, 20),
                                radius: 22
                            });
                            this.position = this.kineticable.getPosition();
                            this.bound = this.kineticable.toCircle();
                            this.dimension = this.kineticable.getDimension();
                            this.canvasSize = Game.canvas.getDimension();
                        },
                        update: function (deltaT) {
                            if (this.position.y > this.canvasSize.height) {
                                this.position.y = -this.dimension.height;
                            }
                            if (this.position.x > this.canvasSize.width) {
                                this.position.x = -this.dimension.width;
                            } else if (this.position.x + this.dimension.width < 0){
                                this.position.x = this.canvasSize.width;
                            }

                            this.base.update(deltaT);
                            // Check Collision Here

                            SAT.collideGroup(this, group1, collisionType);
                            SAT.collideGroup(this, group2, collisionType);
                        }
                    }),
                    obj2 = BaseObject(Spritable, Kineticable).add({
                        init: function () {
                            // spritable config
                            this.spritable.setup({
                                position: {
                                    x: math.random(0, Game.canvas.getDimension().width - 25),
                                    y: Game.canvas.getDimension().height - 25
                                },
                                image: Loader.getAsset('ball2')
                            });

                            // kineticable config
                            this.kineticable.setup({
                                gravity: Vector(0, 0.5),
                                bounce: 0.6,
                                velocity: Vector(math.random(-10, 10), 0),
                                maxVelocity: Vector(0, 20),
                                radius: 22
                            });
                            this.position = this.kineticable.getPosition();
                            this.bound = this.kineticable.toCircle();
                            this.dimension = this.kineticable.getDimension();
                            this.canvasSize = Game.canvas.getDimension()
                        },
                        update: function (deltaT) {
                            if (this.position.y > this.canvasSize.height) {
                                this.position.y = -this.dimension.height;
                            }
                            if (this.position.x > this.canvasSize.width) {
                                this.position.x = -this.dimension.width;
                            } else if (this.position.x + this.dimension.width < 0){
                                this.position.x = this.canvasSize.width;
                            }

                            this.base.update(deltaT);
                            // Check Collision Here

                            SAT.collideGroup(this, group1, collisionType);
                            SAT.collideGroup(this, group2, collisionType);
                        }
                    });

                group1.push(obj1);
                group2.push(obj2);
                Game.add(obj1);
                Game.add(obj2);
            }
        });
    }
);