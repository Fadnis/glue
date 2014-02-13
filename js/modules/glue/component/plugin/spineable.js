glue.module.create(
    'glue/component/plugin/spineable', [
        'glue',
        'glue/math/rectangle',
        'glue/math/vector',
        'glue/math/dimension',
        'glue/loader'
    ],
    function (Glue, Rectangle, Vector, Dimension, Loader) {
        // - cross instance private members -

        /**
         * Constructor
         * @name
         * @memberOf Spineable
         * @function
         * @param {Object} obj: the entity object
         * @param {Object} spineSettings: contains json and atlas
         */
        return function (object) {
            // - per instance private members -
            var sugar = Glue.sugar,
                atlas = {},
                skeletons = {},
                skeletonJson = {},
                skeletonData = {},
                stateData = {},
                state = {},
                currentSkeleton = '',
                currentAnimationStr = '',
                time = new Date().getTime(),
                vertices = Array(8),
                settings,
                rectangle = Rectangle(0, 0, 0, 0),
                skeletonRectangles = {},
                cornerPoints = {},
                origins = {},
                /**
                 * Initalizes the animation
                 * @name initSpine
                 * @memberOf Spineable
                 * @function
                 */
                initSpine = function (spineSettings) {
                    if (!sugar.isDefined(spineSettings)) {
                        throw 'Specify settings object to Spine';
                    }
                    if (!sugar.isDefined(spineSettings.atlas)) {
                        throw 'Specify an atlas to settings object ';
                    }
                    if (!sugar.isDefined(spineSettings.atlasImage)) {
                        throw 'Specify an atlasImage to settings object ';
                    }
                    if (!sugar.isDefined(spineSettings.skeleton)) {
                        throw 'Specify a skeleton JSON to settings object ';
                    }
                    currentSkeleton = spineSettings.skeleton;
                    addAtlas(spineSettings);
                    addSkeletonData(spineSettings);
                    if (spineSettings.position && object) {
                        object.setPosition(spineSettings.position);
                    }
                },
                /**
                 * Loads the atlas data
                 * @name loadAtlas
                 * @memberOf Spineable
                 * @function
                 */
                addAtlas = function (spineSettings) {
                    var atlasText = spineSettings.atlas,
                        p = {},
                        image = spineSettings.atlasImage;
                    atlas[currentSkeleton] = new spine.Atlas(atlasText, {
                        load: function (page, path) {
                            var texture = image;
                            page.image = texture;
                            page.width = texture.width;
                            page.height = texture.height;
                            p = page;
                        }
                    });
                    atlas[currentSkeleton].updateUVs(p);
                },
                /**
                 * Adds the skeleton data to arrays
                 * @name addSkeletonData
                 * @memberOf Spineable
                 * @function
                 */
                addSkeletonData = function (spineSettings) {
                    skeletonJson[currentSkeleton] = new spine.SkeletonJson(
                        new spine.AtlasAttachmentLoader(atlas[currentSkeleton])
                    );
                    if (spineSettings.skeletonResolution) {
                        skeletonJson[currentSkeleton].scale = spineSettings.skeletonResolution;
                    }

                    skeletonData[currentSkeleton] = skeletonJson[currentSkeleton].readSkeletonData(
                        spineSettings.skeleton
                    );
                    skeletons[currentSkeleton] = new spine.Skeleton(skeletonData[currentSkeleton]);
                    spine.Bone.yDown = true;
                    if (object) {
                        skeletons[currentSkeleton].getRootBone().x = object.getPosition().x;
                        skeletons[currentSkeleton].getRootBone().y = object.getPosition().y;
                    }
                    skeletons[currentSkeleton].updateWorldTransform();

                    stateData[currentSkeleton] = new spine.AnimationStateData(skeletonData[currentSkeleton]);
                    state[currentSkeleton] = new spine.AnimationState(stateData[currentSkeleton]);

                    calculateRectangle();
                },
                /**
                 * Calculate rectangle by setting up the skeleton once
                 * @name calculateRectangle
                 * @memberOf Spineable
                 * @function
                 */
                calculateRectangle = function () {
                    var skeleton = skeletons[currentSkeleton],
                        i = 0,
                        l = skeleton.slots.length,
                        slot = {},
                        attachment = {},
                        boneRectangle = Rectangle(0, 0, 0, 0),
                        rootBone = skeleton.getRootBone(),
                        skeletonRectangle = Rectangle(0, 0, 0, 0);
                    if (object) {
                        skeletonRectangle.x1 = object.getPosition().x;
                        skeletonRectangle.y1 = object.getPosition().y;
                    }
                    // set up the skeleton to get width/height of the sprite
                    for (i; i < l; ++i) {
                        slot = skeleton.slots[i];
                        attachment = slot.attachment;
                        if (!(attachment instanceof spine.RegionAttachment)) {
                            continue;
                        }
                        attachment.computeVertices(skeleton.x, skeleton.y, slot.bone, vertices);
                        boneRectangle.x1 = vertices[2];
                        boneRectangle.y1 = vertices[3];
                        boneRectangle.setWidth(attachment.width);
                        boneRectangle.setHeight(attachment.height);
                        skeletonRectangle.union(boneRectangle);
                    }
                    skeletonRectangles[currentSkeleton] = skeletonRectangle;
                    cornerPoints[currentSkeleton] = Vector(0, 0);
                    cornerPoints[currentSkeleton].x = skeletonRectangle.x1 - rootBone.x;
                    cornerPoints[currentSkeleton].y = skeletonRectangle.y1 - rootBone.y;
                    origins[currentSkeleton] = Vector(0, 0);
                    updateVisible();
                },
                /**
                 * Update visible component's dimension to correct skeleton
                 * @name updateBoundingbox
                 * @memberOf Spineable
                 * @function
                 */
                updateVisible = function () {
                    var scale = Vector(1, 1),
                        skeletonRectangle = skeletonRectangles[currentSkeleton],
                        width,
                        height;
                    if (object) {
                        if (object.scalable) {
                            scale = object.scalable.getScale();
                        }
                        // update visible dimension
                        width = skeletonRectangle.getWidth() * Math.abs(scale.x);
                        height = skeletonRectangle.getHeight() * Math.abs(scale.y);
                        object.setDimension(Dimension(width, height));
                    }
                };

            // - external interface -
            object = object || {};
            object.spineable = {
                /**
                 * Draw the spine component
                 * @name draw
                 * @memberOf Spineable
                 * @function
                 */
                draw: function (deltaT, context, scroll) {
                    var slot = {},
                        attachment = {},
                        skeleton = skeletons[currentSkeleton],
                        i = 0,
                        l = skeleton.drawOrder.length,
                        x, y, w, h,
                        px, py,
                        scaleX, scaleY,
                        boneScaleX, boneScaleY,
                        angle,
                        corner = cornerPoints[currentSkeleton],
                        origin = origins[currentSkeleton],
                        vOrigin = Vector(0, 0),
                        position = Vector(0, 0),
                        offset;
                    context.save();
                    if (object) {
                        vOrigin = object.getOrigin();
                        position = object.getPosition();
                        context.translate(~~position.x, ~~position.y);
                    }
                    offset = Vector((corner.x + origin.x + vOrigin.x), (corner.y + origin.y + vOrigin.y));
                    if (object.scalable) {
                        object.scalable.draw(deltaT, context);
                    }
                    if (object.rotatable) {
                        object.rotatable.draw(deltaT, context);
                    }
                    for (i; i < l; ++i) {
                        slot = skeleton.drawOrder[i];
                        attachment = slot.attachment;
                        if (!(attachment instanceof spine.RegionAttachment)) {
                            continue;
                        }
                        attachment.computeVertices(skeleton.x, skeleton.y, slot.bone, vertices);
                        x = (vertices[2] - offset.x);
                        y = (vertices[3] - offset.y);
                        w = attachment.rendererObject.width;
                        h = attachment.rendererObject.height;
                        px = attachment.rendererObject.x;
                        py = attachment.rendererObject.y;
                        scaleX = attachment.scaleX;
                        scaleY = attachment.scaleY;
                        boneScaleX = slot.bone.scaleX;
                        boneScaleY = slot.bone.scaleY;
                        angle = -(slot.bone.worldRotation + attachment.rotation) * Math.PI / 180;

                        context.save();
                        context.translate(~~x, ~~y);
                        context.rotate(angle);
                        context.globalAlpha = slot.a;
                        context.scale(boneScaleX * scaleX, boneScaleY * scaleY);

                        context.drawImage(attachment.rendererObject.page.image, px, py, w, h, 0, 0, w, h);
                        context.restore();
                    }
                    context.restore();

                    // draw boundingbox
                    // var b=object.visible.getBoundingBox();
                    // context.strokeRect(b.x1,b.y1,b.getWidth(),b.getHeight());
                },
                /**
                 * Update the animation
                 * @name update
                 * @memberOf Spineable
                 * @function
                 */
                update: function (deltaT) {
                    var skeleton = skeletons[currentSkeleton];
                    state[currentSkeleton].update(deltaT);
                    state[currentSkeleton].apply(skeleton);
                    skeleton.updateWorldTransform();
                    return true;
                },
                /**
                 * Setup the spineable
                 * @name setup
                 * @memberOf Spineable
                 * @function
                 */
                setup: function (s) {
                    settings = s;
                    initSpine(settings);
                },
                /**
                 * Set a new animation
                 * @name setAnimationByName
                 * @memberOf Spineable
                 * @function
                 * @param {Number} trackIndex: Track number
                 * @param {String} animationName: Name of the animation
                 * @param {Bool} loop: Wether the animation loops
                 */
                setAnimationByName: function (trackIndex, animationName, loop) {
                    currentAnimationStr = animationName;
                    state[currentSkeleton].setAnimationByName(trackIndex, animationName, loop);
                    skeletons[currentSkeleton].setSlotsToSetupPose();
                },
                /**
                 * Set a new animation if it's not playing yet, returns true if successful
                 * @name setAnimation
                 * @memberOf Spineable
                 * @function
                 * @param {String} animationName: Name of the animation
                 */
                setAnimation: function (animationName) {
                    if (currentAnimationStr === animationName) {
                        return false;
                    }
                    object.spineable.setAnimationByName(0, animationName, true);
                    return true;
                },
                /**
                 * Get current animation being played
                 * @name getAnimation
                 * @memberOf Spineable
                 * @function
                 */
                getAnimation: function () {
                    return currentAnimationStr;
                },
                /**
                 * Retrieves the root bone object of the current skeleton
                 * @name getRootBone
                 * @memberOf Spineable
                 * @function
                 */
                getRootBone: function () {
                    return skeletons[currentSkeleton].getRootBone();
                },
                /**
                 * Gets the current skeleton scale
                 * @name getResolution
                 * @memberOf Spineable
                 * @function
                 */
                getSkeletonResolution: function () {
                    return skeletonJson[currentSkeleton].scale;
                },
                /**
                 * Adds another skeleton json to the spineable
                 * @name addSkeleton
                 * @memberOf Spineable
                 * @function
                 * @param {Object} spineSettings: object with atlasImage, atlas, skeleton and optionally scale and resolution
                 */
                addSkeleton: function (spineSettings) {
                    initSpine(spineSettings);
                },
                /**
                 * Sets the current skeleton json
                 * @name setSkeleton
                 * @memberOf Spineable
                 * @function
                 * @param {String} strSkeleton: skeleton json name (as specified in resources)
                 */
                setSkeleton: function (strSkeleton) {
                    if (currentSkeleton === strSkeleton) {
                        return;
                    }
                    currentSkeleton = strSkeleton;
                    object.spineable.update();
                },
                /**
                 * Returns the name of the current skeleton json
                 * @name getSkeleton
                 * @memberOf Spineable
                 * @function
                 */
                getSkeleton: function () {
                    return currentSkeleton;
                },
                /**
                 * Sets the origin of the current skeleton (it's summed with visible's origin)
                 * @name setOrigin
                 * @memberOf Spineable
                 * @function
                 * @param {Object} pos: x and y position relative to the upper left corner point
                 */
                setOrigin: function (pos) {
                    origins[currentSkeleton] = pos;
                    updateVisible();
                },
                /**
                 * Gets the origin of the current skeleton
                 * @name getOrigin
                 * @memberOf Spineable
                 * @function
                 */
                getOrigin: function () {
                    return origins[currentSkeleton];
                },
                /**
                 * Resets the origin of the current skeleton to the root bone position
                 * @name resetOrigin
                 * @memberOf Spineable
                 * @function
                 */
                resetOrigin: function () {
                    origins[currentSkeleton] = {
                        x: -cornerPoints[currentSkeleton].x,
                        y: -cornerPoints[currentSkeleton].y
                    };
                    updateVisible();
                }
            };

            object.register('update', object.spineable.update);
            object.register('draw', object.spineable.draw);

            return object;
        };
    }
);