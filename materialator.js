(function() {
    'use strict';

    var app = angular.module('app', []);

    app.config(['$compileProvider', function ($compileProvider) {
        $compileProvider.debugInfoEnabled(false);
        $compileProvider.commentDirectivesEnabled(false);
        $compileProvider.cssClassDirectivesEnabled(false);
    }]);

    app.run(['$animate', '$templateCache', '$window', '$timeout', function ($animate, $templateCache, $window, $timeout) {
        $animate.enabled(false);
        $templateCache.put('itemTB.html', "<div id='itemToolBoxIncludeWrapper'><ng-include src=\"'itemToolBox.html'\"></ng-include></div>");
        $window.onload = function () {
            console.log('End loading page');
            $timeout(function () {
                angular.element(document.querySelector('.splash')).remove();
            }, 3000, false);
        }
    }]);

    app.controller('MyController', ['$scope', '$templateCache', '$compile', 'ItemDataFactory', 'CurrentStateService', '$timeout', function ($scope, $templateCache, $compile, ItemDataFactory, CurrentStateService, $timeout) {
        $scope.caca = 5;

        var itemsArr = ItemDataFactory.getData();
        var pageArr = ['Item: 1'];
        $scope.itemQuantity = 4;
        $scope.itemCounter = $scope.itemQuantity;
        $scope.itemSize = 9;
        $scope.itemWidth = 9;
        $scope.itemHeight = 9;
        $scope.fontSize = 60;
        $scope.divitionSize = 80;
        $scope.itemsArr = itemsArr;
        $scope.pageArr = pageArr;
        $scope.borderWidth = 2;
        $scope.borderColor = '#FF1493';
        $scope.rowGap = 1;
        $scope.objectFitSelect = 'cover';

        $scope.template = 0; // Initial loading template number

        $scope.selectedTemplate = function (selectedTemplate) {
            console.log('selectedTemplate', selectedTemplate)
            $scope.template = selectedTemplate;
            $scope.itemsArr = [];
            ItemDataFactory.resetItemsArr();
            $timeout(function () {
                $scope.ok();
            }, 0, true);
        }

        $scope.print = function () {
            window.print();
        }

        // Recive broadcast from directive----------------------------------------------------------
        // function bindDataToController(itemData) {
        //     return function (event, recivedData) {
        //         angular.extend(itemData, recivedData);
        //         $scope.itemData = itemData
        //         var template = $templateCache.get('itemToolBox.html');
        //         var $template = $compile(template)($scope);
        //         angular.element(document.querySelector('.column-b')).append($template)
        //     };
        // }
        // $scope.$on('nameOfEvent', bindDataToController(this));
        // $scope.$on('nameOfEvent', bindDataToController(this));
        // -----------------------------------------------------------------------------------------

        // Load Image------------------------------------------------------------------------------
        // var input = angular.element(document.querySelector('#masterImageInput'));
        // input[0].addEventListener('change', function (event) {
        //     console.log(event);
        //     loadFiles(event, true)
        // });

        function loadFiles(event, input) {
            var file, name, reader, size, type;
            file = input ? event.target.files : event.dataTransfer.files;
            reader = new FileReader();
            reader.file = file[0];

            reader.onload = function (evt) {
                for (let i = 0; i < $scope.itemQuantity; i++) {
                    fillCanvas(evt.target.result, i);
                }
                console.log('IMG Loaded');
                var fname = this.file.name;
                var fsize = Math.round(this.file.size / 1024) + ' KB';
                $scope.fileName = fname;
                $scope.$apply();
            }

            name = file[0].name;
            type = file[0].type;
            size = file[0].size;
            reader.readAsDataURL(file[0]);
        }

        function fillCanvas(blob, i) {
            let itemData = ItemDataFactory.getItem(i + 1);
            let itemArrPosI = itemData.arrPosition.i;
            let itemArrPosJ = itemData.arrPosition.j;
            if (itemData.data.imgIsLocked) return;
            let s = "#img" + (i + 1);
            let el = angular.element(document.querySelector(s));

            let canvas = document.createElement("canvas");
            let ctx = canvas.getContext('2d');
            let img = new Image();

            img.onload = function () {
                canvas.width = img.width;
                canvas.height = img.height;
                canvas.style = "width: 100%;height:-webkit-fill-available;object-fit: var(--object-fit);position: absolute;top: 0px;bottom: 0px;left: 0px;right: 0px;";
                canvas.id = "img" + (i + 1);
                let hRatio = canvas.width / img.width;
                let vRatio = canvas.height / img.height;
                let ratio = Math.max(hRatio, vRatio); // Math.max crop to fit canvas, Math.min no crop
                let centerShift_x = (canvas.width - img.width * ratio) / 2;
                let centerShift_y = (canvas.height - img.height * ratio) / 2;
                // ctx.clearRect(0, 0, canvas.width, canvas.height);
                // ctx.fillStyle = "white";
                // ctx.fillRect(0, 0, canvas.width, canvas.height);
                // ctx.drawImage(img, 0, 0, img.width, img.height, centerShift_x, centerShift_y, img.width * ratio, img.height * ratio);
                ctx.drawImage(img, 0, 0, img.width, img.height);
                ItemDataFactory.saveItem(blob, itemArrPosI, itemArrPosJ, 'img');
            }
            img.src = blob;
            el[0].replaceWith(canvas);
        }
        // End of Load Image-----------------------------------------------------------------------

        // Modal create template-------------------------------------------------------------------
        // let modalCreateTemplate = angular.element(document.querySelector('modal-create-template'));

        $scope.createTemplate = function () {
            console.log('createTemplate')
            const modalCreateTemplate = angular.element(document.querySelector('.modal-create-template'));
            modalCreateTemplate.addClass('is-active');
            // angular.element(document.querySelector('html')).css({overflow: 'hidden'});
        }

        // $scope.closeModalCreateTemplateBtn = function () {
        //     modalCreateTemplate.removeClass('is-active');
        // }
        // End Modal create template---------------------------------------------------------------

        // Modal select template-------------------------------------------------------------------
        let body = angular.element(document.querySelector('body'));

        $scope.changeTemplate = function () {
            console.log('changeTemplate');
            let modalSelectTemplate = angular.element(document.querySelector('#modalSelectTemplate'));

            if (modalSelectTemplate.length === 0) {
                body.append($compile('<modal-select-template></modal-select-template>')($scope));
            }
            else {
                modalSelectTemplate.addClass('is-active');
            }
        }

        $scope.closeModalbtn = function () {
            let modalSelectTemplate = angular.element(document.querySelector('#modalSelectTemplate'));
            modalSelectTemplate.removeClass('is-active');
        }

        $scope.okModalbtn = function () {
            let modalSelectTemplate = angular.element(document.querySelector('#modalSelectTemplate'));
            modalSelectTemplate.removeClass('is-active');
        }
        // End of Modal select template------------------------------------------------------------


        // scope input functions-----------------------------------------------------------
        // vm.t2BorderImageSizeCss = t2BorderImageSizeCss;
        // vm.t2BackgroundBorderRadiusCss = t2BackgroundBorderRadiusCss;
        // vm.t2BackgroundWidthCss = t2BackgroundWidthCss;
        // vm.t2BackgroundHeightCss = t2BackgroundHeightCss;
        // vm.t2BackgroundColorCss = t2BackgroundColorCss;
        // vm.t2FrontImageSizeCss = t2FrontImageSizeCss;
        // vm.t2FrontImagePosXCss = t2FrontImagePosXCss;
        // vm.t2FrontImagePosYCss = t2FrontImagePosYCss;

        // vm.chageFontSizeCss = chageFontSizeCss;
        // vm.chageBorderWidthCss = chageBorderWidthCss;
        // vm.chageBorderColorCss = chageBorderColorCss;
        // vm.chageImage = chageImage;
        // --------------------------------------------------------------------------------

        // Template 2 calling--------------------------------------------------------------
        // $scope.t2BorderImageSizeCss = function (value) {
        //     console.log('t2BorderImageSizeCss', value)
        //     document.documentElement.style.setProperty('--t2BorderImageSize', value + '%');
        // }
        // $scope.t2BorderWidthCss = function (value) {
        //     console.log('t2BorderWidthCss', value)
        //     document.documentElement.style.setProperty('--border-width', value + 'px');
        // }
        // $scope.t2BorderColorCss = function (value) {
        //     console.log('t2BorderColorCss', value)
        //     document.documentElement.style.setProperty('--border-color', value);
        // }
        // End ofTemplate 2 calling--------------------------------------------------------

        $scope.ok = function ok() {
            var itemsArr = [];
            var pageArr = [];
            var itemQuantity = $scope.itemQuantity;
            $scope.itemCounter = itemQuantity;
            var itemSize = $scope.itemSize;
            var itemWidth = $scope.itemWidth;
            var itemHeight = $scope.itemHeight;
            var fontSize = $scope.fontSize;
            var divitionSize = $scope.divitionSize;
            var borderWidth = $scope.borderWidth;
            var borderColor = $scope.borderColor;
            var rowGap = $scope.rowGap;
            var objectFitSelect = $scope.objectFitSelect;

            // var rows = itemSize < 28 ? Math.floor(28.7 / (itemSize + rowGap)) : 1;
            // var cols = itemSize <= 19 ? Math.floor(19 / itemSize) : 1;
            // var pages = Math.ceil(itemQuantity / (rows * cols));

            var rows = itemHeight < 28 ? Math.floor(28.7 / (itemHeight + rowGap)) : 1;
            var cols = itemWidth <= 19 ? Math.floor(19 / itemWidth) : 1;
            var pages = Math.ceil(itemQuantity / (rows * cols));

            $scope.rows = rows;
            $scope.cols = cols;
            $scope.pages = pages;

            console.log("%c rows: " + rows, 'background: #111; color: #bada55')
            console.log("%c cols: " + cols, 'background: #111; color: #bada55')
            console.log("%c pages: " + pages, 'background: #111; color: #bada55')

            var maxItemsPerPage = rows * cols;
            $scope.maxItemsPerPage = maxItemsPerPage;
            console.log("%c maxItemsPerPage: " + maxItemsPerPage, 'background: #111; color: #bada55')
            var itemsLeft = itemQuantity;
            var counter = 1;

            for (var i = 0; i < pages; i++) {
                pageArr.push("page: " + (i + 1));
                itemsArr.push([]);

                for (var j = 0; j < itemQuantity; j++) {
                    if (j === maxItemsPerPage || itemsLeft === 0) break;
                    // itemsArr[i].push({ id: counter, isCustom: false, template: 'template1', name: "test4", isLocked: false, img: "images/127458.jpg", borderImg: "images/127458.jpg", imgIsLocked: false, css: { elementObjectFitSelect: 'var(--object-fit)', elementDivitionSize: 'var(--image-wrapper-size)', elementFontSize: "var(--font-size)", elementBorderWidth: 'var(--border-width)', elementBorderColor: 'var(--border-color)' } });
                    // itemsArr[i].push({ id: counter, isCustom: true, template: '<my-image><my-text></my-text></my-image>', name: "test1", isLocked: false, img: "images/127458.jpg", borderImg: "images/127458.jpg", imgIsLocked: false, css: { elementObjectFitSelect: 'var(--object-fit)', elementDivitionSize: 'var(--image-wrapper-size)', elementFontSize: "var(--font-size)", elementBorderWidth: 'var(--border-width)', elementBorderColor: 'var(--border-color)' } });
                    itemsArr[i].push({
                        id: counter, isCustom: true, isLocked: false,
                        customElements: {}
                    });
                    itemsLeft--;
                    counter++;
                }
            }

            ItemDataFactory.saveData(itemsArr);

            document.documentElement.style.setProperty('--item-size', itemSize + 'cm');
            document.documentElement.style.setProperty('--item-width', itemWidth + 'cm');
            document.documentElement.style.setProperty('--item-height', itemHeight + 'cm');
            document.documentElement.style.setProperty('--font-size', fontSize + 'px');
            document.documentElement.style.setProperty('--image-wrapper-size', divitionSize + '%');
            document.documentElement.style.setProperty('--border-width', borderWidth + 'px');
            document.documentElement.style.setProperty('--border-color', borderColor);
            document.documentElement.style.setProperty('--row-gap', rowGap + 'cm');
            document.documentElement.style.setProperty('--object-fit', objectFitSelect);

            $scope.pageArr = pageArr;
            $scope.itemsArr = itemsArr;
        }

        /*
        page     21 cm
        wrapper  18.9 cm
    
        2 itemss * 9 itemSize = 18 cm
        3 itemss * 9 itemSize = 27 cm
    
        how many itemss per row?
        itemss*itemSize /18.9
        */
    }]);

    app.directive('scrollUpBtn', [function () {
        return {
            restrict: 'E',
            replace: true,
            template: '<button id="scrollUpBtn" class="button is-dark is-large" ng-click="scrollUp()"><span class="icon has-text-danger"><i class= "fas fa-fw fa-3x fa-arrow-alt-circle-up"></i></span></button>',
            link: function (scope, element, attrs) {
                window.onscroll = function () { scrollFunction() };
                function scrollFunction() {
                    if (document.body.scrollTop > 20 || document.documentElement.scrollTop > 20) {
                        element.css({ display: "block" });
                    } else {
                        element.css({ display: "none" });
                    }
                }
                scope.scrollUp = function () {
                    document.body.scrollTop = 0;
                    document.documentElement.scrollTop = 0;
                }
            }
        }
    }]);

    app.directive('notificationDispatcher', ['$timeout', '$compile', function ($timeout, $compile) {
        return {
            restrict: 'E',
            // templateUrl: 'notifications.html',
            link: function (scope, element, attrs) {

                // let notificationsArr = ['This is a notification test number 1','This is another notification test 2 😊'];
                // let notificationsArr = [];
                // scope.notifications = notificationsArr;

                scope.$on('notification', function (event, data) {
                    // notificationsArr.push(data);
                    // scope.notifications = notificationsArr;
                    // scope.$apply();
                    // timer();
                    element.append($compile('<notification>' + data + '</notification>')(scope));
                })

                // scope.closeNotification = function(index) {
                //     notificationsArr.splice(index, 1);
                //     scope.notifications = notificationsArr;
                // }

                // function timer (){
                //     $timeout(function () {
                //         notificationsArr.splice(0, 1);
                //         scope.notifications = notificationsArr;
                //         if (notificationsArr.length > 0) {
                //             timer();
                //         }
                //     }, 3000, true);
                // }
            }
        }
    }]);

    app.directive('notification', ['$timeout', function ($timeout) {
        return {
            restrict: 'E',
            scope: true,
            replace: true,
            transclude: true,
            templateUrl: 'notifications.html',
            link: function (scope, element, attrs) {

                element.addClass('show');

                scope.closeNotification = function () {
                    element.remove();
                }

                let t1, t2;
                t1 = $timeout(function () {
                    element.removeClass('show');
                    t2 = $timeout(function () {
                        element.addClass('hide');
                        element.on("animationend", hideAnimEnd);
                    }, 25, false);
                }, 3000, true);

                function hideAnimEnd() {
                    element.remove();
                }

                element.on('$destroy', function () {
                    scope.closeNotification = null;
                    $timeout.cancel(t1);
                    $timeout.cancel(t2);
                    element.off("animationend", hideAnimEnd);
                });
            }
        }
    }]);

    app.directive('modalCreateTemplate', ['EditModeService', function (EditModeService) {
        return {
            restrict: 'E',
            replace: true,
            scope: false,
            templateUrl: 'modalCreateTemplate.html',
            // controller: 'MyController',
            link: function (scope, element, attrs) {
                let dropZoneGrid = {};
                let dropZoneGridItem = {};
                let cols = 2;
                let rows = 2;
                let itemsGridArr = EditModeService.getItemsGridArr();
                scope.itemsGridArr = itemsGridArr;

                scope.vSvgLinesArr = Array;
                scope.vSvgLines = cols;
                scope.hSvgLinesArr = Array;
                scope.hSvgLines = rows;
                scope.dropGrid = { selected: false };


                // let area = [["a1", "a2"], 
                //             ["a3", "a4"]];
                let area = EditModeService.getAreaArr();
                // let s = '"a1 a2" "a3 a4"';
                let s = EditModeService.getAreaString();
                let selectedItems = EditModeService.getSelectedItems();
                scope.grid = { cols: 2, rows: 2 };

                // element.addClass('is-active');

                scope.closeModalCreateTemplateBtn = function () {
                    element.removeClass('is-active');
                }

                angular.element(function () {
                    dropZoneGrid = angular.element(element[0].querySelector('.drop-zone-grid'));
                    dropZoneGrid.css({ gridTemplateAreas: "'a1 a2' 'a3 a4'", gridTemplateColumns: '50% 50%', gridTemplateRows: '50% 50%' });
                    dropZoneGridItem = angular.element(element[0].querySelectorAll('.drop-zone-grid-item'));
                })

                scope.merge = function () {
                    s = EditModeService.getAreaString();
                    itemsGridArr = EditModeService.getItemsGridArr();
                    selectedItems = EditModeService.getSelectedItems();
                    if (selectedItems.length < 2) return;
                    console.log('merge', selectedItems);
                    console.log('itemsGridArr', itemsGridArr);
                    let w = 0;
                    let h = 0;
                    let wArr = [];
                    let hArr = [];
                    let sortedSelectedItems = selectedItems.sort(function (a, b) { return a - b });

                    let startIndex = itemsGridArr.findIndex(function (elem) {
                        return elem.val === sortedSelectedItems[0];
                    });
                    let startPosition = itemsGridArr[startIndex].position.start;

                    let endIndex = itemsGridArr.findIndex(function (elem) {
                        return elem.val === sortedSelectedItems[sortedSelectedItems.length - 1];
                    });
                    let endPosition = itemsGridArr[endIndex].position.start;

                    console.log('start-----------------', startPosition)
                    console.log('end-----------------', endPosition)

                    for (let i = 1; i < selectedItems.length; i++) {

                        let exp = `a${selectedItems[i]}\\s|a${selectedItems[i]}'`;
                        let regex = new RegExp(exp, "g");

                        while (s.match(regex)) {
                            s = s.replace(("a" + selectedItems[i]), ("a" + selectedItems[0]));
                        }

                        let index = itemsGridArr.findIndex(function (elem) {
                            return elem.val === selectedItems[i];
                        });

                        itemsGridArr.splice(index, 1);

                        for (let j = 0; j < area.length; j++) {
                            for (let k = 0; k < area[j].length; k++) {

                                if (area[j][k] === "a" + selectedItems[i]) {
                                    area[j][k] = "a" + selectedItems[0];
                                    j = area.length; //break first loop
                                    break;
                                }
                            }
                        }
                    }
                    console.log('s', s);
                    console.log('area', area);
                    EditModeService.setAreaString(s);

                    let index = itemsGridArr.findIndex(function (elem) {
                        return elem.val === selectedItems[0];
                    });

                    console.log('w ' + ((Math.max(endPosition.col, startPosition.col) - Math.min(endPosition.col, startPosition.col)) + 1)
                        + ' h ' + ((Math.max(endPosition.row, startPosition.row) - Math.min(endPosition.row, startPosition.row)) + 1));

                    itemsGridArr[index].w = ((Math.max(endPosition.col, startPosition.col) - Math.min(endPosition.col, startPosition.col)) + 1);
                    itemsGridArr[index].h = ((Math.max(endPosition.row, startPosition.row) - Math.min(endPosition.row, startPosition.row)) + 1);

                    itemsGridArr[index].position.end = endPosition;

                    console.log('item', itemsGridArr[index])
                    // console.log('itemsGridArr', itemsGridArr);

                    EditModeService.setAreaArr(area);
                    dropZoneGrid.css({ gridTemplateAreas: s });
                    scope.itemsGridArr = itemsGridArr;
                    EditModeService.setItemsGridArr(itemsGridArr);
                    selectedItems = [];
                    EditModeService.setSelectedItems(selectedItems);

                    let selectedItemsClass = angular.element(document.querySelectorAll('.item-selected'));
                    for (let i = 0; i < selectedItemsClass.length; i++) {
                        selectedItemsClass.removeClass('item-selected');
                        selectedItemsClass.css({ backgroundColor: '#363636' })
                    }
                    scope.dropGrid.selected = false;
                }

                scope.reset = function () {
                    console.log('reset')
                    scope.grid = { cols: 2, rows: 2 };
                    scope.changeColRow('grid.cols', 2);
                    scope.changeColRow('grid.rows', 2);
                    EditModeService.setSelectedItems([]);
                }

                scope.save = function () {
                    let customTemplate = angular.element(element[0].querySelector('.custom-template'));
                    let customTemplateClone = customTemplate.clone();

                    let dummys = angular.element(customTemplateClone[0].querySelectorAll('.dummy'));
                    for (let i = 0; i < dummys.length; i++) {
                        angular.element(dummys[i]).parent().remove();
                    }

                    let myText = angular.element(customTemplateClone[0].querySelectorAll('.replace-me-my-text'));
                    let myImage = angular.element(customTemplateClone[0].querySelectorAll('.replace-me-my-image'));
                    let svg = angular.element(customTemplateClone[0].querySelectorAll('.svg-grid'));

                    if (myText.length > 0) {
                        for (let j = 0; j < myText.length; j++) {
                            angular.element(myText[j]).replaceWith('<my-text></my-text>');
                        }
                    }
                    if (myImage.length > 0) {
                        for (let k = 0; k < myImage.length; k++) {
                            angular.element(myImage[k]).replaceWith('<my-image></my-image>');
                        }
                    }

                    for (let i = 0; i < svg.length; i++) {
                        angular.element(svg[i]).remove();
                    }

                    let dropZoneGrid = angular.element(customTemplateClone[0].querySelectorAll('.drop-zone-grid'));
                    dropZoneGrid.css({
                        width: '100%',
                        height: '100%',
                        display: 'grid',
                        gridGap: '0px'
                    })
                    let dropZoneGridItem = angular.element(customTemplateClone[0].querySelectorAll('.drop-zone-grid-item'));
                    dropZoneGridItem.css({
                        position: 'relative',
                        backgroundColor: '#ffffff',
                        // border: 'solid 1px #ff7878',
                        display: 'flex',
                        alignContent: 'center',
                        justifyContent: 'center',
                        alignItems: 'center',
                        overflow: 'hidden'
                    })
                    dropZoneGridItem.removeAttr('ng-repeat');
                    dropZoneGridItem.removeClass('drop-zone-grid-item');
                    dropZoneGrid.removeClass('drop-zone-grid');

                    EditModeService.save(customTemplateClone);
                }

                scope.changeColRow = function (who, val) {
                    itemsGridArr = [];
                    switch (who) {
                        case 'grid.cols':
                            if (val < 1) { scope.grid.cols = 1; val = 1; }
                            else if (val > 12) { scope.grid.cols = 12; val = 12; }
                            scope.vSvgLines = val;
                            fillGrid('gridTemplateColumns', val);
                            EditModeService.setGridCols(val);
                            break;
                        case 'grid.rows':
                            if (val < 1) { scope.grid.rows = 1; val = 1; }
                            else if (val > 12) { scope.grid.rows = 12; val = 12; }
                            scope.hSvgLines = val;
                            fillGrid('gridTemplateRows', val);
                            EditModeService.setGridRows(val);
                            break;
                        default: break;
                    }

                    function fillGrid(gridTemplate, val) {
                        gridTemplate === 'gridTemplateColumns' ? cols = val : rows = val;
                        // dropZoneGrid.css({ [gridTemplate]: 'repeat(' + val + ',1fr)' });
                        dropZoneGrid.css({ [gridTemplate]: `repeat(${val}, ${(100 / val)}%)` });

                        let counter = 1;
                        for (let i = 0; i < rows; i++) {
                            for (let j = 0; j < cols; j++) {
                                itemsGridArr.push({ val: counter, isDummy: true, w: 1, h: 1, position: { start: { row: i, col: j }, end: { row: i, col: j } } });
                                counter++;
                            }
                        }

                        getArea();
                        EditModeService.setItemsGridArr(itemsGridArr);
                        scope.itemsGridArr = itemsGridArr;
                    }

                    if (itemsGridArr.length >= 5 && itemsGridArr.length < 50) {
                        document.documentElement.style.setProperty('--drop-zone-grid-item-font-size', '20px');
                    }
                    else if (itemsGridArr.length >= 50) {
                        document.documentElement.style.setProperty('--drop-zone-grid-item-font-size', '15px');
                    }
                    else {
                        document.documentElement.style.setProperty('--drop-zone-grid-item-font-size', '35px');
                    }
                }

                function getArea() {
                    let counter = 1;
                    s = "";
                    area = [];
                    for (let j = 0; j < rows; j++) {
                        area.push([]);
                        for (let k = 0; k < cols; k++) {
                            area[j][k] = ("a" + counter);

                            if (((j === 0 && k === 0) || k === 0) && cols > 1) {
                                s = s + ' ' + ("'a" + counter);
                            }
                            else if (((j === (cols - 1) && k === (rows - 1)) || k === (cols - 1)) && cols > 1) {
                                s = s + ' ' + ("a" + counter + "'");
                            }
                            else if (cols === 1) {
                                s = s + ' ' + ("'a" + counter + "'");
                            }
                            else {
                                s = s + ' ' + ("a" + counter);
                            }

                            counter++;
                        }
                    }
                    dropZoneGrid.css({ gridTemplateAreas: s });
                    EditModeService.setAreaArr(area);
                    EditModeService.setAreaString(s);
                    console.log('s', s);
                    console.log('area', area);
                    return area;
                }

                // scope.$emit('itemsGridArr', itemsGridArr);
                // scope.$on('itemsGridArr', function(event, data){
                //     console.log('hello brodcast',data)
                //     scope.itemsGridArr = data;
                //     scope.$apply();
                //     EditModeService.setItemsGridArr(data);
                // })
            }
        }
    }]);

    app.directive('dragLine', ['$compile', '$document', 'EditModeService', function ($compile, $document, EditModeService) {
        return {
            restrict: 'A',
            replace: false,
            transclude: false,
            scope: false,
            link: function (scope, element, attrs) {

                let startRow = 0;
                let startCol = 0;
                let itemWidth = 0;
                let itemHeight = 0;
                let areaArr = EditModeService.getAreaArr();
                let itemsGridArr = EditModeService.getItemsGridArr();
                let gridCols = EditModeService.getGridCols() > 1 ? EditModeService.getGridCols() : 1;
                let gridRows = EditModeService.getGridRows();
                let itemElement = {};
                let itemElementWidth = 0;
                let startX = 0; let startY = 0; let x = 0; let y = 0;
                let realX = 0; let realY = 0;
                let neighborIndexs = [];
                let unitItemWidth = 0;
                let moveX = 0;
                let previousMoveX = 0;
                let moveY = 0;
                let previousMoveY = 0;
                let pathBlocked = false;
                let itemNumber = parseInt(element.parent().parent().parent().attr('item-number'));
                let itemIndex = itemsGridArr.findIndex(function (elem) {
                    return elem.val === itemNumber;
                })

                angular.element(function () {
                    itemElement = angular.element(element.parent().parent().parent());
                    itemElementWidth = itemElement[0].offsetWidth;
                })

                let gridElement = angular.element(document.querySelector('.drop-zone-grid'));
                let gridWidth = 0;

                switch (attrs.pos) {
                    case 'left':
                    case 'right': element.css({ cursor: 'ew-resize' }); break;
                    case 'top':
                    case 'bottom': element.css({ cursor: 'ns-resize' }); break;
                    default: break;
                }

                element.on('mousedown', function (event) {
                    event.preventDefault();
                    EditModeService.isResizing(true);
                    switch (attrs.pos) {
                        case 'left':
                        case 'right': gridElement.css({ cursor: 'ew-resize' }); break;
                        case 'top':
                        case 'bottom': gridElement.css({ cursor: 'ns-resize' }); break;
                        default: break;
                    }
                    gridCols = EditModeService.getGridCols() > 1 ? EditModeService.getGridCols() : 1;
                    gridWidth = gridElement[0].offsetWidth;
                    unitItemWidth = Math.round((gridWidth / gridCols));
                    itemElementWidth = itemElement[0].offsetWidth;
                    x = 0; y = 0;
                    startX = event.pageX - x;
                    startY = event.pageY - y;
                    $document.on('mousemove', docMousemove);
                    $document.on('mouseup', docMouseup);
                })

                function docMousemove(event) {
                    // console.log('event.movementY', event.movementY)
                    realY = event.pageY - startY;
                    realX = event.pageX - startX;

                    x = Math.round((event.pageX - startX) / unitItemWidth) * unitItemWidth;
                    y = Math.round((event.pageY - startY) / unitItemWidth) * unitItemWidth;

                    if (attrs.pos === 'right' && (pathBlocked === false || event.movementX < 0)) {
                        moveX = x / unitItemWidth;
                    }
                    else if (attrs.pos === 'left' && (pathBlocked === false || event.movementX > 0)) {
                        moveX = x / unitItemWidth;
                    }

                    if (attrs.pos === 'bottom' && (pathBlocked === false || event.movementY > 0)) {
                        moveY = y / unitItemWidth;
                    }
                    else if (attrs.pos === 'top' && (pathBlocked === false || event.movementY < 0)) {
                        moveY = y / unitItemWidth;
                    }

                    if ((moveX !== previousMoveX) || (moveY !== previousMoveY)) {
                        // console.log('x            ', x)
                        // console.log('moveX        ', moveX)
                        // console.log('previousMoveX', previousMoveX)

                        // console.log('y            ', y)
                        // console.log('moveY        ', moveY)
                        // console.log('previousMoveY', previousMoveY)
                        move();
                    }
                }

                function move() {
                    if ((Math.abs(moveX) !== Math.abs(previousMoveX)) || (Math.abs(moveY) !== Math.abs(previousMoveY))) {

                        // previousMoveX = moveX;
                        itemNumber = parseInt(element.parent().parent().parent().attr('item-number'));

                        itemsGridArr = EditModeService.getItemsGridArr();
                        itemIndex = itemsGridArr.findIndex(function (elem) {
                            return elem.val === itemNumber;
                        });

                        // console.log('xxxxxxxxxxxxxxxxxxxitemNumber', itemNumber)
                        // console.log('xxxxxxxxxxxxxxxxxxxitemIndex', itemIndex)
                        // console.log('xxxxxxxxxxxxxxxxxxxitemsGridArr', itemsGridArr)
                        // itemElement.css({ zIndex: 0, width: 'initial' })
                        startRow = itemsGridArr[itemIndex].position.start.row;
                        startCol = itemsGridArr[itemIndex].position.start.col;
                        itemWidth = itemsGridArr[itemIndex].w;
                        itemHeight = itemsGridArr[itemIndex].h;

                        switch (attrs.pos) {
                            case 'right':
                                if (moveX > previousMoveX && itemWidth < gridCols && event.movementX > 0) {
                                    let safeSpace = checkNeighbor('right');
                                    if (safeSpace !== 0) { grow(moveX, 'right'); previousMoveX = moveX; }
                                }
                                else if (moveX < previousMoveX && itemWidth > 1 && event.movementX < 0) {
                                    pathBlocked = false;
                                    reduce('right');
                                    previousMoveX = moveX;
                                }
                                break;
                            case 'left':
                                if (moveX < previousMoveX && itemWidth < gridCols && event.movementX < 0) {
                                    let safeSpace = checkNeighbor('left');
                                    if (safeSpace !== 0) { grow(moveX, 'left'); previousMoveX = moveX; }
                                }
                                else if (moveX > previousMoveX && itemWidth > 1 && event.movementX > 0) {
                                    pathBlocked = false;
                                    reduce('left');
                                    previousMoveX = moveX;
                                }
                                break;
                            case 'top':
                                if (moveY < previousMoveY && itemHeight < gridRows && event.movementY < 0) {
                                    let safeSpace = checkNeighbor('top');
                                    if (safeSpace !== 0) { grow(moveY, 'top'); previousMoveY = moveY; }
                                }
                                else if (moveY > previousMoveY && itemHeight > 1 && event.movementY > 0) {
                                    pathBlocked = false;
                                    reduce('top');
                                    previousMoveY = moveY;
                                }
                                break;
                            case 'bottom':
                                if (moveY > previousMoveY && itemHeight < gridRows && event.movementY > 0) {
                                    let safeSpace = checkNeighbor('bottom');
                                    if (safeSpace !== 0) { grow(moveY, 'bottom'); previousMoveY = moveY; }
                                }
                                else if (moveY < previousMoveY && itemHeight > 1 && event.movementY < 0) {
                                    pathBlocked = false;
                                    reduce('bottom');
                                    previousMoveY = moveY;
                                }
                                break;
                            default: break;
                        }
                    }
                }

                function checkNeighbor(position) {

                    let offset = 0;
                    let xyLenght = 0;
                    switch (position) {
                        case 'right':
                            if ((startCol + itemWidth) >= gridCols) return 0;
                            offset = itemWidth;
                            xyLenght = itemHeight;
                            break;
                        case 'left':
                            if (startCol === 0) return 0;
                            offset = -1;
                            xyLenght = itemHeight;
                            break;
                        case 'top':
                            if (startRow === 0) return 0;
                            offset = -1;
                            xyLenght = itemWidth;
                            break;
                        case 'bottom':
                            if ((startRow + itemHeight) >= gridRows) return 0;
                            offset = itemHeight;
                            xyLenght = itemWidth;
                            break;
                        default: break;
                    }

                    for (let i = 0; i < xyLenght; i++) {

                        let index = 0;
                        if (position === 'right' || position === 'left') {
                            console.log("Neighbor", areaArr[startRow + i][startCol + offset]);
                            index = itemsGridArr.findIndex(function (elem) {
                                return elem.val === parseInt(areaArr[startRow + i][startCol + offset].slice(1));
                            });
                        }
                        else if (position === 'top' || position === 'bottom') {
                            console.log("Neighbor", areaArr[startRow + offset][startCol + i]);
                            index = itemsGridArr.findIndex(function (elem) {
                                return elem.val === parseInt(areaArr[startRow + offset][startCol + i].slice(1));
                            });
                        }

                        if (!itemsGridArr[index].isDummy) {
                            console.log('CHOCAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAa');
                            pathBlocked = true;
                            neighborIndexs = [];
                            return 0;
                        }
                        else {
                            pathBlocked = false;
                            neighborIndexs.push(index);
                        }
                    }

                    console.log('neighborIndexs', neighborIndexs)
                    neighborIndexs.sort(function (a, b) { return a - b });
                    return neighborIndexs.length / itemHeight;
                }

                function grow(val, position) {

                    itemNumber = parseInt(element.parent().parent().parent().attr('item-number'));
                    let offset = 0;
                    let parent = element.parent().parent().parent();

                    switch (position) {
                        case 'right': console.log('---grow right---');
                            offset = itemWidth;
                            itemsGridArr[itemIndex].position.end.col += 1;
                            itemsGridArr[itemIndex].w += 1;

                            for (let i = 0; i < itemHeight; i++) {
                                areaArr[startRow + i][startCol + offset] = 'a' + itemNumber;
                            }

                            for (let i = (itemHeight - 1); i >= 0; i--) {
                                // console.log('borraaa---->', itemsGridArr[neighborIndexs[i]])
                                itemsGridArr.splice(neighborIndexs[i], 1); //sort neighborindexes
                            }

                            break;
                        case 'left': console.log('---grow left---');
                            offset = -1;
                            itemsGridArr[itemIndex].position.start.col -= 1;
                            itemsGridArr[itemIndex].w += 1;

                            for (let i = 0; i < itemHeight; i++) {
                                areaArr[startRow + i][startCol + offset] = 'a' + (itemNumber - 1);
                                for (let j = 0; j < itemWidth; j++) {
                                    areaArr[startRow + i][startCol + j] = 'a' + (itemNumber - 1);
                                }
                            }

                            parent.css({ gridArea: 'a' + (itemNumber - 1) });
                            parent.attr('item-number', parent.attr('item-number') - 1);

                            itemsGridArr[itemIndex].val -= 1;

                            for (let i = (itemHeight - 1); i >= 0; i--) {
                                // console.log('borraaa---->', itemsGridArr[neighborIndexs[i]])
                                itemsGridArr.splice(neighborIndexs[i], 1);
                            }

                            break;
                        case 'top': console.log('---grow top---');
                            offset = -1;
                            itemsGridArr[itemIndex].position.start.row -= 1;
                            itemsGridArr[itemIndex].h += 1;

                            for (let i = 0; i < itemHeight + 1; i++) {
                                for (let j = 0; j < itemWidth; j++) {
                                    areaArr[startRow + offset + i][startCol + j] = 'a' + (itemNumber - gridCols);
                                }
                            }

                            parent.css({ gridArea: 'a' + (itemNumber - gridCols) });
                            parent.attr('item-number', parent.attr('item-number') - gridCols);

                            itemsGridArr[itemIndex].val -= gridCols;

                            for (let i = (itemWidth - 1); i >= 0; i--) {
                                // console.log('borraaa---->', itemsGridArr[neighborIndexs[i]])
                                itemsGridArr.splice(neighborIndexs[i], 1);
                            }

                            break;

                        case 'bottom': console.log('---grow bottom---');
                            offset = itemHeight;
                            itemsGridArr[itemIndex].position.end.row += 1;
                            itemsGridArr[itemIndex].h += 1;

                            for (let i = 0; i < itemWidth; i++) {
                                areaArr[startRow + offset][startCol + i] = 'a' + itemNumber;
                            }

                            for (let i = (itemWidth - 1); i >= 0; i--) {
                                // console.log('borraaa---->', itemsGridArr[neighborIndexs[i]])
                                itemsGridArr.splice(neighborIndexs[i], 1);
                            }

                            break;
                        default: break;
                    }

                    EditModeService.setAreaArr(areaArr);
                    getAreaString(areaArr);
                    // console.log('itemsGridArr', itemsGridArr)
                    // console.log(areaArr);
                    neighborIndexs = [];
                    itemsGridArr.sort(function (a, b) { return a.val - b.val });
                    EditModeService.setItemsGridArr(itemsGridArr);
                    scope.itemsGridArr = itemsGridArr;
                    scope.$apply();
                }

                function reduce(position) {

                    let endCol = itemsGridArr[itemIndex].position.end.col;
                    let newVal = 0;
                    itemNumber = parseInt(element.parent().parent().parent().attr('item-number'));
                    const c = itemNumber + itemWidth;
                    let offset = 0;

                    switch (position) {
                        case 'right':
                            console.log('---reduce right---');
                            offset = itemWidth;

                            for (let i = 0; i < itemHeight; i++) {
                                newVal = (itemNumber + itemWidth - 1) + (gridCols * i);
                                areaArr[startRow + i][startCol + itemWidth - 1] = 'a' + newVal;
                                itemsGridArr.push({ val: newVal, isDummy: true, w: 1, h: 1, position: { start: { row: startRow + i, col: startCol + itemWidth - 1 }, end: { row: startRow + i, col: startCol + itemWidth - 1 } } });
                                // itemsGridArr.splice(newVal - 1, 0, { val: newVal, isDummy: true, w: 1, h: 1, position: { start: { row: startRow + i, col: startCol + itemWidth - 1 }, end: { row: startRow + i, col: startCol + itemWidth - 1 } } });
                            }

                            itemsGridArr[itemIndex].position.end.col -= 1;
                            itemsGridArr[itemIndex].w -= 1;
                            break;

                        case 'left':
                            console.log('---reduce left---');
                            offset = -1;

                            for (let i = 0; i < itemHeight; i++) {
                                newVal = (itemNumber) + (gridCols * i);
                                // console.log('****newVal****', newVal);
                                areaArr[startRow + i][startCol] = 'a' + newVal;

                                for (let j = 0; j < itemWidth - 1; j++) {
                                    areaArr[startRow + i][startCol + 1 + j] = 'a' + (itemsGridArr[itemIndex].val + 1);
                                }

                                itemsGridArr.push({ val: newVal, isDummy: true, w: 1, h: 1, position: { start: { row: startRow + i, col: startCol + itemWidth - 1 }, end: { row: startRow + i, col: startCol + itemWidth - 1 } } });
                                // itemsGridArr.splice(newVal - 1, 0, { val: newVal, isDummy: true, w: 1, h: 1, position: { start: { row: startRow + i, col: startCol + itemWidth - 1 }, end: { row: startRow + i, col: startCol + itemWidth - 1 } } });
                            }

                            itemsGridArr[itemIndex].position.start.col += 1;
                            itemsGridArr[itemIndex].val += 1;
                            itemsGridArr[itemIndex].w -= 1;
                            element.parent().parent().parent().css({ gridArea: 'a' + itemsGridArr[itemIndex].val });
                            break;

                        case 'top':
                            console.log('---reduce top---');
                            offset = -1;

                            for (let i = 0; i < itemWidth; i++) {
                                newVal = (itemNumber) + (i);
                                // console.log('****newVal****', newVal);
                                areaArr[startRow][startCol + i] = 'a' + newVal;
                                itemsGridArr.push({ val: newVal, isDummy: true, w: 1, h: 1, position: { start: { row: startRow, col: startCol + i }, end: { row: startRow, col: startCol + i } } });
                                // itemsGridArr.splice(newVal - 1, 0, { val: newVal, isDummy: true, w: 1, h: 1, position: { start: { row: startRow, col: startCol + i }, end: { row: startRow, col: startCol + i } } });

                                for (let j = 0; j < itemHeight - 1; j++) {
                                    areaArr[startRow + 1 + j][startCol + i] = 'a' + (itemsGridArr[itemIndex].val + gridCols);
                                }
                            }

                            itemsGridArr[itemIndex].position.start.row += 1;
                            itemsGridArr[itemIndex].h -= 1;
                            itemsGridArr[itemIndex].val += gridCols;
                            element.parent().parent().parent().css({ gridArea: 'a' + itemsGridArr[itemIndex].val });
                            break;

                        case 'bottom':
                            console.log('---reduce bottom---');
                            offset = itemHeight;

                            for (let i = 0; i < itemWidth; i++) {
                                newVal = (itemNumber + (gridCols * (itemHeight - 1))) + (i);
                                // console.log('****newVal****', newVal);
                                areaArr[startRow + itemHeight - 1][startCol + i] = 'a' + newVal;
                                itemsGridArr.push({ val: newVal, isDummy: true, w: 1, h: 1, position: { start: { row: startRow + itemHeight - 1, col: startCol + i }, end: { row: startRow + itemHeight - 1, col: startCol + i } } });
                                // itemsGridArr.splice(newVal - 1, 0, { val: newVal, isDummy: true, w: 1, h: 1, position: { start: { row: startRow + itemHeight - 1, col: startCol + i }, end: { row: startRow + itemHeight - 1, col: startCol + i } } });
                            }

                            itemsGridArr[itemIndex].position.end.row -= 1;
                            itemsGridArr[itemIndex].h -= 1;
                            break;
                        default: break;
                    }

                    // console.log(areaArr)
                    EditModeService.setAreaArr(areaArr);
                    getAreaString(areaArr);
                    EditModeService.setItemsGridArr(itemsGridArr);
                    itemsGridArr.sort(function (a, b) { return a.val - b.val });
                    // console.log(itemsGridArr)
                    scope.itemsGridArr = itemsGridArr;
                    scope.$apply();
                }

                function getAreaString(arr) {
                    let s = "";
                    for (let j = 0; j < arr.length; j++) {
                        for (let k = 0; k < arr[j].length; k++) {

                            if ((j === 0 && k === 0) || k === 0) {
                                s = s + ' ' + (`'${arr[j][k]}`);
                            }
                            else if ((j === (arr[j].length - 1) && k === (arr.length - 1)) || k === (arr[j].length - 1)) {
                                s = s + ' ' + (`${arr[j][k]}'`);
                            }
                            else {
                                s = s + ' ' + (`${arr[j][k]}`);
                            }
                        }
                    }

                    let dropZoneGrid = angular.element(document.querySelector('.drop-zone-grid'));
                    // console.log(dropZoneGrid)
                    dropZoneGrid.css({ gridTemplateAreas: s });
                    EditModeService.setAreaString(s);
                    // console.log('***********',s);
                }

                function turnOffMouseMove() {
                    $document.off('mousemove', docMousemove);
                    startX = 0; startY = 0; x = 0; y = 0;
                }

                function docMouseup() {
                    EditModeService.isResizing(false);
                    let arr = [];
                    previousMoveX = 0;
                    previousMoveY = 0;
                    gridElement.css({ cursor: 'default' });
                    EditModeService.setSelectedItems(arr);
                    $document.off('mousemove', docMousemove);
                    $document.off('mouseup', docMouseup);
                }

            }
        }
    }]);

    app.directive('myDrag', ['$compile', '$document', function ($compile, $document) {
        return {
            restrict: 'E',
            replace: true,
            transclude: true,
            scope: false,
            // require: '^^modalCreateTemplate',
            template: '<div ng-transclude class="draggable-item"></div>',
            link: function (scope, element, attrs, modalCreateTemplateController) {

                element.on('dragstart', function (event) {
                    // event.dataTransfer.setData("text", event.currentTarget.id);
                    // console.log(event.currentTarget.firstElementChild.nodeName);
                    // scope.dragElement = angular.element(event.currentTarget).children().clone();
                    scope.dragElement = { element: angular.element(event.currentTarget).children().clone(), type: event.currentTarget.firstElementChild.nodeName };
                })

            }
        }
    }]);

    app.directive('myDrop', ['MouseDownService', '$document', '$compile', 'EditModeService', 'NotificationsFactory', function (MouseDownService, $document, $compile, EditModeService, NotificationsFactory) {
        return {
            restrict: 'E',
            replace: true,
            transclude: true,
            scope: false,
            // require: '^^modalCreateTemplate',
            template: `<div class="drop-zone-grid-item custom-drop-zone-grid-item"><p ng-transclude class="dummy"></p><div/>`,
            compile: function (tElement, tAttrs) {
                return {
                    pre: function (iScope, iElement, iAttrs) {

                    },
                    post: function (scope, element, attrs, modalCreateTemplateController) {

                        let selectedItems = EditModeService.getSelectedItems();

                        element.css({ gridArea: 'a' + attrs.itemNumber });

                        element.on('dragover', function (event) {
                            event.preventDefault();
                            element.css({ transform: 'scale(0.9)', zIndex: 9 })
                        })
                        element.on('dragleave', function (event) {
                            event.preventDefault();
                            element.css({ transform: 'unset', zIndex: 'unset' })
                        })

                        element.on('drop', function (event) {
                            // console.log(element[0].getBoundingClientRect());
                            // element.contents().replaceWith(scope.dragElement);
                            element.css({ transform: 'unset', zIndex: 'unset' })
                            element.contents().replaceWith(scope.dragElement.element);
                            let dragLines = $compile(`<svg class="svg-grid svg-to-remove">
                        <g><line x1="0%" y1="0%" x2="0%" y2="100%" class="svg-lines" drag-line pos="left"></line></g>
                        <g><line x1="100%" y1="0%" x2="100%" y2="100%" class="svg-lines" drag-line pos="right"></line></g>
                        <g><line x1="0%" y1="0%" x2="100%" y2="0%" class="svg-lines" drag-line pos="top"></line></g>
                        <g><line x1="0%" y1="100%" x2="100%" y2="100%" class="svg-lines" drag-line pos="bottom"></line></g>
                        </svg>`)(scope);
                            element.append(dragLines);

                            let width = element[0].offsetWidth;
                            let height = element[0].offsetHeight;
                            let ratio = (width / height);
                            let w = 0;
                            if (width > height) { w = (100 / ratio) - 5; }
                            else { w = 100; }
                            let f = 0;
                            if (width > height) { f = 100; }
                            else { f = (100 * ratio) - 5; }

                            // element.css({ fontSize: ((width+height)/2)-(width/2)-10 +'px' });

                            if (scope.dragElement.type === 'IMG') {
                                // angular.element(element[0].firstElementChild).css({ fontSize: f + '%', maxWidth: w + '%', pointerEvents: 'none' });
                                angular.element(element[0].firstElementChild).css({ width: 'auto', height: '80%', position: 'absolute', pointerEvents: 'none' });

                            }
                            else if (scope.dragElement.type === 'P') {
                                // angular.element(element[0].firstElementChild).css({ fontSize: f + '%' });
                                let elemW = element[0].getBoundingClientRect().width;
                                let elemH = element[0].getBoundingClientRect().height;
                                let elemAFratio = 0;
                                if (elemH >= elemW) { elemAFratio = Math.round(((elemW * elemH) / 1000) - (elemW * 0.2)); }
                                else { elemAFratio = Math.round(((elemW * elemH) / 1000) - (elemH * 0.2)); }
                                if (elemAFratio < 10) { elemAFratio = 10; }
                                else if (elemAFratio > 240) { elemAFratio = 240; }
                                angular.element(element[0].firstElementChild).css({ fontSize: elemAFratio + 'px' });
                            }

                            let itemsGridArr = EditModeService.getItemsGridArr();
                            let itemIndex = itemsGridArr.findIndex(function (elem) {
                                return elem.val === parseInt(attrs.itemNumber);
                            })
                            itemsGridArr[itemIndex].isDummy = false;
                        })

                        element.on('mousedown', mousedown);
                        element.on('mouseenter', mouseenter);

                        function mousedown(event) {
                            if (EditModeService.isResizing() === false) {
                                selectedItems = EditModeService.setSelectedItems([]);
                                // angular.element(document.querySelector('.grid-drop-col')).css({ cursor: 'nw-resize'});
                                angular.element(document.querySelector('.grid-drop-col')).addClass('resize-cursor');
                                MouseDownService.down();
                                $document.on('mouseup', docMouseup);
                                selectItem();
                            }
                        }
                        function mouseenter(event) {
                            if (MouseDownService.status() === true) {
                                selectItem();
                            }
                        }
                        function docMouseup(event) {
                            MouseDownService.up();
                            $document.off('mouseup', docMouseup);
                            angular.element(document.querySelector('.grid-drop-col')).removeClass('resize-cursor');
                        }
                        function cleanGrid() {
                            let dropZoneGridItem = angular.element(document.querySelectorAll('.drop-zone-grid-item'));
                            for (let i = 0; i < dropZoneGridItem.length; i++) {
                                angular.element(dropZoneGridItem[i]).removeClass('item-selected');
                                angular.element(dropZoneGridItem[i]).css({ backgroundColor: '#363636' })
                                scope.dropGrid.selected = false;
                                scope.$apply();
                                selectedItems = [];
                                EditModeService.setSelectedItems(selectedItems);
                            }
                        }

                        function selectItem() {
                            // console.log(EditModeService.getItemsGridArr())
                            selectedItems = EditModeService.getSelectedItems();
                            if (safeSelect(selectedItems) === false) return;
                            // if (!element.hasClass('item-selected')) {
                            //     element.addClass('item-selected');
                            //     element.css({ backgroundColor: 'cadetblue' })
                            //     selectedItems.push(parseInt(attrs.itemNumber));
                            //     EditModeService.setSelectedItems(selectedItems);
                            //     scope.dropGrid.selected = true ;
                            //     scope.$apply();
                            //     console.log('selected', selectedItems)
                            // }
                            else {
                                // element.removeClass('item-selected');
                                // element.css({ backgroundColor: '#363636' })
                                // let index = selectedItems.indexOf(parseInt(attrs.itemNumber));
                                // selectedItems.splice(index, 1);
                                // EditModeService.setSelectedItems(selectedItems);
                                // if (selectedItems.length === 0) {
                                //     scope.dropGrid.selected = false;
                                //     scope.$apply();
                                // }
                                // console.log('de selected', selectedItems)
                            }
                        }

                        function safeSelect(selectedItems) {
                            let tempArr = [];
                            let gridCols = EditModeService.getGridCols();
                            let gridRows = EditModeService.getGridRows();
                            let dropZoneGridItem = angular.element(document.querySelectorAll('.drop-zone-grid-item'));

                            // let itemsTotalArea = gridCols * gridRows;
                            // let itemsCurrentArea = dropZoneGridItem.length;
                            // let areaOffset = itemsTotalArea - itemsCurrentArea;
                            // console.log('itemsTotalArea:', itemsTotalArea, 'itemsCurrentArea:', itemsCurrentArea, 'offset',areaOffset)

                            let itemSelected = angular.element(document.querySelectorAll('.item-selected'));
                            for (let j = 0; j < itemSelected.length; j++) {
                                angular.element(itemSelected[j]).removeClass('item-selected');
                                angular.element(itemSelected[j]).css({ backgroundColor: '#363636' })
                            }

                            if (selectedItems.length === 0) {
                                element.addClass('item-selected');
                                element.css({ backgroundColor: 'cadetblue' })
                                selectedItems.push(parseInt(attrs.itemNumber));
                                EditModeService.setSelectedItems(selectedItems);
                                scope.dropGrid.selected = false;
                                scope.$apply();
                            }
                            else {
                                // let row = Math.floor((parseInt(attrs.itemNumber)-1) / gridCols);
                                let col = (parseInt(attrs.itemNumber) - 1) % gridCols;
                                let firstSelectedItemRec = dropZoneGridItem[selectedItems[0] - 1].getBoundingClientRect();
                                let firstSelectedItemArea = firstSelectedItemRec.width * firstSelectedItemRec.height;
                                console.log(firstSelectedItemArea)

                                for (let i = selectedItems[0] - 1; i < parseInt(attrs.itemNumber); i++) {
                                    if ((i % gridCols) <= col && (i % gridCols) >= ((selectedItems[0] - 1) % gridCols)) {
                                        for (let j = dropZoneGridItem.length - 1; j >= 0; j--) {
                                            if (parseInt(dropZoneGridItem[j].attributes['item-number'].value) === (i + 1)) {
                                                if ((dropZoneGridItem[j].getBoundingClientRect().width * dropZoneGridItem[j].getBoundingClientRect().height) !== firstSelectedItemArea) {
                                                    console.log('woaaaaaaaaaaaaaaaaa')
                                                    docMouseup();
                                                    cleanGrid();
                                                    NotificationsFactory.show("Woops.. can't do irregular shapes!");
                                                    return false;
                                                }
                                                // console.log((dropZoneGridItem[j].getBoundingClientRect().width * dropZoneGridItem[j].getBoundingClientRect().height))
                                                // console.log(dropZoneGridItem[j])
                                                angular.element(dropZoneGridItem[j]).addClass('item-selected');
                                                angular.element(dropZoneGridItem[j]).css({ backgroundColor: 'cadetblue' });
                                                tempArr.push(i + 1);
                                                break;
                                            }
                                            else {
                                                if (j === 0) {
                                                    console.log('woaaaaaaaaaaaaaaaaa')
                                                    docMouseup();
                                                    cleanGrid();
                                                    NotificationsFactory.show("Woops.. can't do irregular shapes!");
                                                    return false;
                                                }
                                            }
                                        }
                                    }
                                    else if ((i % gridCols) >= col && (i % gridCols) < gridCols - 1) {
                                        i += (gridCols - ((i + 1) % gridCols)); // offset for loop for performance
                                    }
                                }

                                if (tempArr.length < 2) {
                                    scope.dropGrid.selected = false;
                                }
                                else {
                                    scope.dropGrid.selected = true;
                                }
                                EditModeService.setSelectedItems(tempArr);
                                scope.$apply();
                            }
                        }
                    }
                }
            }
        }
    }]);

    app.directive('myImageToolbox', ['$compile', 'CurrentStateService', 'ItemDataFactory', function ($compile, CurrentStateService, ItemDataFactory) {
        return {
            restrict: 'E',
            replace: false,
            scope: true,
            require: ['^?item', '^?myImage'],
            // controller: function(){
            //     // let myImageToolboxController = this;

            //     // myImageToolboxController.$onInit = function(){
            //     //     myImageToolboxController.cagadademierda = null;
            //     // }
            // },
            templateUrl: 'myImage/myImageToolbox.html',
            compile: function () {
                return {
                    pre: function (scope, element, attrs, controllers) {

                        scope.$on('dropDownClick', function (event, data) {
                            // console.log('hello brodcast in myImageToolbox', data);
                            scope.showForm1 = false;
                        })

                    },
                    post: function (scope, element, attrs, controllers) {
                        // console.log('post myImageToolbox')
                        const itemController = controllers[0];
                        const myImageController = controllers[1];
                        const myImageToolboxController = controllers[2];

                        if (itemController) {
                            const itemToolboxCard = angular.element(document.querySelector('#itemToolboxCard' + itemController.itemNumber));
                            itemToolboxCard.append(element);

                            if (parseInt(itemController.itemNumber) === 1) {
                                const toolboxClone = angular.element(document.querySelector('#toolboxClone'));
                                const copy = angular.copy(element)
                                // CurrentStateService.setCurrentCustomImageId(myImageController.callerId);
                                // console.log(angular.element(element[0].querySelector('.toolbox-form-wrapper')).attr('target-id'))

                                let compiledCopy = $compile(copy)(scope);
                                // console.log(compiledCopy[0])

                                angular.element(function () {
                                    let toolboxFormWrapper = angular.element(compiledCopy[0].querySelector('.toolbox-form-wrapper'));
                                    // console.log(toolboxFormWrapper[0])
                                    toolboxFormWrapper.attr('target-id', myImageController.callerId);
                                    toolboxClone.append(compiledCopy);
                                })
                            }

                            // scope.itemNumber = myImageController.callerId;

                            // scope.elementObjectFitSelect = function (val) {
                            //     let targetId = '#img' + itemController.itemNumber + 'grid' + myImageController.callerId;
                            //     angular.element(document.querySelector(targetId)).css({ objectFit: val });
                            // }
                        }
                        // else {
                        //     scope.elementObjectFitSelect = function (val) {
                        //         console.log(val)
                        //         // let targetId = [];

                        //         let itemsCount = angular.element(document.querySelectorAll('.item'));
                        //         let item1 = angular.element(document.querySelectorAll('#item1'));
                        //         angular.element(function () {
                        //             let customTargetId = element.children().attr('target-id');
                        //             console.log(customTargetId);
                        //             for (let i = 1; i <= itemsCount.length; i++) {
                        //                 let temp = angular.element(document.querySelectorAll('#img' + i + 'grid' + customTargetId))
                        //                 if (temp.length > 0) {
                        //                     // targetId.push(temp[0]);
                        //                     temp.css({ objectFit: val });
                        //                 }
                        //             }
                        //         })
                        //     }
                        // }

                        if (itemController) {
                            scope.changeBlend = function (val) {
                                let targetId = '#img' + itemController.itemNumber + 'grid' + myImageController.callerId;
                                angular.element(document.querySelector(targetId)).css({ mixBlendMode: val });

                                console.log('img' + myImageController.callerId)
                                let gridItem = 'img' + myImageController.callerId;
                                ItemDataFactory.saveItemStyle(val, itemController.itemArrPosI, itemController.itemArrPosJ, 'mixBlendMode', attrs.propertyValue, gridItem);
                            }
                        }
                        else {
                            scope.changeBlend = function (val) {
                                let itemsCount = angular.element(document.querySelectorAll('.item'));
                                let item1 = angular.element(document.querySelectorAll('#item1'));
                                angular.element(function () {
                                    let customTargetId = element.children().attr('target-id');
                                    for (let i = 1; i <= itemsCount.length; i++) {
                                        let temp = angular.element(document.querySelectorAll('#img' + i + 'grid' + customTargetId))
                                        if (temp.length > 0) {
                                            temp.css({ mixBlendMode: val });
                                        }
                                    }
                                    let gridItem = 'img' + customTargetId;
                                    ItemDataFactory.saveItemStyle(val, null, null, 'mixBlendMode', attrs.propertyValue, gridItem);
                                })
                            }
                        }

                        scope.$on('$destroy', function () {
                            console.log('myImageToolbox scope destroyed');
                        })
                        element.on('$destroy', function () {
                            console.log('myImageToolbox element destroyed');
                        })

                    }
                }
            }
        }
    }]);

    app.directive('myImage', ['$compile', '$timeout', 'ItemDataFactory', function ($compile, $timeout, ItemDataFactory) {
        return {
            restrict: 'E',
            replace: true,
            transclude: true,
            scope: true,
            require: ['^?item', 'myImage'],
            controller: [function () {
                let myImageController = this;

                myImageController.$onInit = function () {
                    myImageController.callerId = null;
                }
            }],
            templateUrl: 'myImage/myImage.html',
            compile: function () {
                return {
                    pre: function (scope, element, attrs, controllers) {

                        scope.expand = function () {
                            console.log('expand!')
                            scope.$emit('dropDownClick', '💩');
                            scope.$parent.$broadcast('dropDownClick', '💩');
                        }

                    },
                    post: function (scope, element, attrs, controllers) {

                        const itemController = controllers[0];
                        const myImageController = controllers[1];

                        const img = angular.element(element[0].querySelector('#img'));
                        if (isNaN(parseInt(img.parent().parent().attr('item-number')))) {
                            img[0].id = 'img' + itemController.itemNumber;
                        }
                        else {
                            img[0].id = 'img' + itemController.itemNumber + 'grid' + img.parent().parent().attr('item-number');
                            myImageController.callerId = img.parent().parent().attr('item-number');
                            loadElementStyle();
                        }

                        function loadElementStyle() {
                            addCustomElementToItemsArr();
                            let imageStyle = ItemDataFactory.getItem(itemController.itemNumber).data.customElements['img' + myImageController.callerId].style;
                            let imageSrc = ItemDataFactory.getItem(itemController.itemNumber).data.customElements['img' + myImageController.callerId].imgSrc;
                            let gridItemStyle = ItemDataFactory.getItem(itemController.itemNumber).data.customElements['img' + myImageController.callerId].gridItemStyle;

                            if (imageSrc === 'images/img_placeholder3.svg') {
                                angular.element(element[0].firstElementChild).css({ ...imageStyle, maxHeight: '100%', padding: '20px' });
                            }
                            else {
                                angular.element(element[0].firstElementChild).css({ ...imageStyle });
                            }
                            angular.element(element[0].firstElementChild).attr('src', imageSrc);
                            // element.parent().css({ ...gridItemStyle });
                            element.css({ ...gridItemStyle });
                        }

                        function addCustomElementToItemsArr() {
                            ItemDataFactory.addCustomElementToItemsArr('image', itemController.itemNumber, 'img' + myImageController.callerId);
                        }

                        scope.data = {
                            model: '1',
                            availableOptions: [
                                { id: '1', name: 'normal' },
                                { id: '2', name: 'color' },
                                { id: '3', name: 'color-burn' },
                                { id: '4', name: 'color-dodge' },
                                { id: '5', name: 'multiply' },
                                { id: '6', name: 'screen' },
                                { id: '7', name: 'overlay' },
                                { id: '8', name: 'darken' },
                                { id: '9', name: 'lighten' },
                                { id: '10', name: 'hard-light' },
                                { id: '11', name: 'soft-light' },
                                { id: '12', name: 'difference' },
                                { id: '13', name: 'exclusion' },
                                { id: '14', name: 'hue' },
                                { id: '15', name: 'saturation' },
                                { id: '16', name: 'luminosity' },
                            ]
                        };

                        // scope.changeBlend = function(val) {
                        //     console.log(element.parent()[0])
                        //     let img = angular.element(element[0].querySelector('img'));
                        //     img.css({ mixBlendMode: val})
                        // }

                    }
                }
            }
        }
    }]);

    app.directive('myTextToolbox', ['$compile', 'EditModeService', function ($compile, EditModeService) {
        return {
            restrict: 'E',
            replace: false,
            scope: true,
            require: ['^?item', '^?myText'],
            templateUrl: 'myText/myTextToolbox.html',
            compile: function () {
                return {
                    pre: function (scope, element, attrs, controllers) {

                        scope.$on('dropDownClick', function (event, data) {
                            // console.log('hello brodcast in myTextToolbox', data);
                            scope.showForm1 = false;
                        })

                    },
                    post: function (scope, element, attrs, controllers) {

                        const itemController = controllers[0];
                        const myTextController = controllers[1];

                        if (itemController && EditModeService.status() === false) {

                            // console.log(EditModeService.status())
                            const itemToolboxCard = angular.element(document.querySelector('#itemToolboxCard' + itemController.itemNumber));
                            itemToolboxCard.append(element);

                            if (parseInt(itemController.itemNumber) === 1) {

                                const toolboxClone = angular.element(document.querySelector('#toolboxClone'));
                                const copy = angular.copy(element);

                                let compiledCopy = $compile(copy)(scope);

                                angular.element(function () {
                                    let toolboxFormWrapper = angular.element(compiledCopy[0].querySelector('.toolbox-form-wrapper'));
                                    toolboxFormWrapper.attr('target-id', myTextController.callerId);
                                    toolboxClone.append(compiledCopy);
                                })
                            }
                        }
                        else {
                            // element.remove();
                        }

                        scope.$on('$destroy', function () {
                            console.log('myTextToolbox scope destroyed');
                        })
                        element.on('$destroy', function () {
                            console.log('myTextToolbox element destroyed');
                        })
                    }
                }
            }
        }
    }])

    app.directive('myText', ['$compile', '$timeout', 'ItemDataFactory', function ($compile, $timeout, ItemDataFactory) {
        return {
            restrict: 'E',
            replace: true,
            transclude: true,
            scope: false,
            require: ['^?item', 'myText'],
            controller: [function () {
                let myTextController = this;

                myTextController.$onInit = function () {
                    myTextController.callerId = null;
                }
            }],
            templateUrl: 'myText/myText.html',
            compile: function () {
                return {
                    pre: function (scope, element, attrs, controllers) {

                        scope.expand = function () {
                            console.log('expand!')
                            scope.$emit('dropDownClick', '💩');
                            scope.$parent.$broadcast('dropDownClick', '💩');
                        }

                    },
                    post: function (scope, element, attrs, controllers) {

                        const itemController = controllers[0];
                        const myTextController = controllers[1];

                        const text = angular.element(element[0].querySelector('#text'));
                        if (isNaN(parseInt(text.parent().parent().attr('item-number')))) {
                            text[0].id = 'text' + itemController.itemNumber;
                        }
                        else {
                            text[0].id = 'text' + itemController.itemNumber + 'grid' + text.parent().parent().attr('item-number');
                            myTextController.callerId = text.parent().parent().attr('item-number');
                            loadElementStyle();
                        }

                        function loadElementStyle() {
                            addCustomElementToItemsArr();
                            let textStyle = ItemDataFactory.getItem(itemController.itemNumber).data.customElements['text' + myTextController.callerId].style;
                            let text = ItemDataFactory.getItem(itemController.itemNumber).data.customElements['text' + myTextController.callerId].text;
                            let gridItemStyle = ItemDataFactory.getItem(itemController.itemNumber).data.customElements['text' + myTextController.callerId].gridItemStyle;

                            angular.element(element[0].firstElementChild).css({ ...textStyle });
                            angular.element(element[0].firstElementChild)[0].firstElementChild.innerText = text;
                            // element.parent().css({ ...gridItemStyle });
                            element.css({ ...gridItemStyle });
                        }

                        function addCustomElementToItemsArr() {
                            ItemDataFactory.addCustomElementToItemsArr('text', itemController.itemNumber, 'text' + myTextController.callerId);
                        }

                    }
                }
            }
        }
    }]);

    app.directive('itemToolbox', ['$compile', function ($compile) {
        return {
            restrict: 'A',
            replace: false,
            scope: false,
            require: 'item',
            compile: function (telement, tattrs) {
                return {
                    pre: function (iscope, ielement, iattrs, iitemController) {
                        let itemToolbox = $compile(`
                        <div class="item-toolbox template2ToolBox hideBlock" id="itemToolbox${iitemController.itemNumber}">
                            <div class="card">

                                <header class="card-header">
                                    <span style="margin-left: 10px;" ng-if="isLocked" class="icon has-text-danger">
                                        <i class="fas fa-lock"></i>
                                    </span>
                                    <p class="card-header-title">
                                        Item {{itemId}}
                                    </p>
                                    <button class="delete" ng-click="close()"></button>
                                </header>

                                <div class="scroll-container"  id="itemToolboxCard${iitemController.itemNumber}">

                                <div class="toolbox-form-wrapper scroll-container-item">
                                        <div class="toolbox-form-wrapper-header" ng-class="{'toolbox-form-wrapper-header-selected': showForm1}" ng-init="showForm1=true"
                                            ng-click="expand();showForm1=!showForm1;showForm2=false;showForm3=false;showForm4=false;showForm5=false;">
                                            <div class="pre-icon">
                                                <span class="icon">
                                                    <i class="fas fa-square"></i>
                                                </span>
                                            </div>
                                            <div class="form-wrapper-header-text">
                                                <p>Item</p>
                                            </div>
                                            <div class="form-wrapper-header-icon">
                                                <span class="icon" ng-if="!showForm1">
                                                    <i class="fas fa-chevron-down"></i>
                                                </span>
                                                <span class="icon" ng-if="showForm1">
                                                    <i class="fas fa-chevron-up"></i>
                                                </span>
                                            </div>
                                        </div>
                                        <div class="toolbox-form-wrapper-content" ng-show="showForm1">

                                            <div class="field">
                                                <div class="pre-icon">
                                                    <span class="icon">
                                                        <i class="fas fa-expand"></i>
                                                    </span>
                                                </div>
                                                <div class="input-label">
                                                    <label class="label">Border width {{itemData.borderWidth}} (px) </label>
                                                </div>
                                                <div class="control">
                                                    <input class="input sliderr" type="number" ng-value="itemData.borderWidth" ng-model="itemData.borderWidth" ng-change="changeBorderWidth(itemData.borderWidth)">
                                                </div>
                                            </div>

                                            <div class="field">
                                                <div class="pre-icon">
                                                    <span class="icon">
                                                        <i class="fas fa-paint-brush"></i>
                                                    </span>
                                                </div>
                                                <div class="input-label">
                                                    <label class="label">Border color</label>
                                                </div>
                                                <div class="control">
                                                    <input style="margin-top: 10px;" type="color" id="base" ng-model="itemData.borderColor" ng-change="changeBorderColor(itemData.borderColor)">
                                                </div>
                                            </div>

                                        </div>
                                    </div>

                                </div>
                            </div>
                        </div>`
                        )(iscope)

                        const elementToolsElement = angular.element(document.querySelector('#itemToolBoxIncludeWrapper'));
                        elementToolsElement.append(itemToolbox);
                        iscope.itemId = iitemController.itemNumber;

                        iscope.itemData = { borderWidth: 3, borderColor: '#ff1493' };

                        iscope.changeBorderWidth = function (val) {
                            const item = angular.element(document.querySelector('#item' + iitemController.itemNumber));
                            item.css({ borderWidth: val + 'px' })
                        }
                        iscope.changeBorderColor = function (val) {
                            const item = angular.element(document.querySelector('#item' + iitemController.itemNumber));
                            item.css({ borderColor: val })
                        }

                        iscope.$on('dropDownClick', function (event, data) {
                            // console.log('hello brodcast in itemToolbox', data);
                            iscope.showForm1 = false;
                        })

                        iscope.expand = function () {
                            console.log('expand!')
                            iscope.$emit('dropDownClick', '💩');
                            iscope.$parent.$broadcast('dropDownClick', '💩');
                        }
                    },
                    post: function (scope, element, attrs, itemController) {

                    }
                }
            }
        }
    }]);

    app.directive('itemToolboxHover', ['$timeout', function ($timeout) {
        return {
            restrict: 'A',
            scope: false,
            require: '^^?item',
            compile: function (telement, tattrs) {
                return {
                    post: function (iscope, ielement, iattrs, itemController) {

                        if (itemController) {
                            let targetId = '';
                            let targetItem = {};

                            ielement.on('mouseover', function () {
                                targetId = ielement.parent().parent().attr('target-id');
                                if (targetId) {
                                    // console.log(targetId)
                                    targetItem = angular.element(document.querySelector(targetId));
                                    targetItem.addClass('cute-jump');
                                    // console.log(targetItem[0])
                                }
                            })

                            ielement.on('mouseout', function () {
                                if (targetId) {
                                    $timeout(function () {
                                        targetItem.removeClass('cute-jump');
                                    }, 500, false);
                                }
                            });
                        }

                    }
                }
            }
        }
    }]);

    app.directive('myInput', ['ItemDataFactory', 'ImageReaderFactory', '$compile', '$timeout', 'CurrentStateService', function (ItemDataFactory, ImageReaderFactory, $compile, $timeout, CurrentStateService) {
        return {
            restrict: 'E',
            scope: true,
            // require: '^^?item',
            require: ['^^?item', '^^?myImage', '^^?myText'],
            replace: true,
            template: `<div>
                        <div class="pre-icon">
                            <span class="icon">
                                <i class="fas fa-image"></i>
                            </span>
                        </div>
                        <div class="input-label">
                            <label class="label"></label>
                        </div>
                        <div>
                            <input style="margin-top: 10px;">
                        </div>
                    </div>`,
            compile: function (tele, tattr) {
                // console.log('compile myInput')

                let icon = angular.element(tele[0].querySelector('i'));
                icon.attr('class', `{{${tattr.model}icon}}`);

                let label = angular.element(tele[0].querySelector('.label'));
                if (tattr.property !== 'innerText') {
                    label[0].innerHTML = `{{${tattr.model}label}} {{${tattr.model}value}} {{${tattr.model}units}}`;
                }
                else {
                    label[0].innerHTML = `{{${tattr.model}label}}`;
                }

                let input = angular.element(tele[0].querySelector('input'));
                if (tattr.type !== 'file') {
                    input.attr('ng-model', `${tattr.model}value`);
                    input.attr('ng-change', `${tattr.model}change(${tattr.model}value)`);
                    input.attr('type', `{{${tattr.model}type}}`);
                    input.attr('min', `{{${tattr.model}min}}`);
                    input.attr('max', `{{${tattr.model}max}}`);
                    input.attr('value', `${tattr.model}value`);
                    input.attr('ng-class', `{ slider: ${tattr.model}type === 'range',input: ${tattr.model}type === 'number',input: ${tattr.model}type === 'text' }`);
                }
                else {
                    input.attr('type', `{{${tattr.model}type}}`);
                    input.attr('class', `file-input`);
                    input.attr('multiple', '');
                }

                return {
                    post: function (scope, element, attrs, controllers) {

                        const itemController = controllers[0];
                        const myImageController = controllers[1];
                        const myTextController = controllers[2];
                        let callerId = null;
                        let pagesCount = angular.element(document.querySelectorAll('.page')).length;
                        let columnA = angular.element(document.querySelectorAll('.column-a'));

                        if (myImageController) {
                            callerId = parseInt(myImageController.callerId);
                        }
                        else if (myTextController) {
                            callerId = parseInt(myTextController.callerId);
                        }

                        scope[attrs.model + 'value'] = isNaN(parseInt(attrs.value)) ? attrs.value : parseInt(attrs.value);
                        scope[attrs.model + 'label'] = attrs.label;
                        scope[attrs.model + 'type'] = attrs.type;
                        scope[attrs.model + 'units'] = '';
                        scope[attrs.model + 'min'] = attrs.min;
                        scope[attrs.model + 'max'] = attrs.max;
                        scope[attrs.model + 'icon'] = attrs.icon;

                        let filter = attrs.filter;
                        let propertyValue = attrs.propertyValue;
                        let oldString = '';
                        let newString = '';
                        let units = '';
                        let targetId = [];
                        let customTargetId = null;
                        let itemArrPosI = null;
                        let itemArrPosJ = null;

                        if (itemController) {

                            let itemNumber = itemController.itemNumber;

                            scope.itemData = {};
                            let itemData = ItemDataFactory.getItem(itemNumber);
                            itemArrPosI = scope.itemArrPosI = itemController.itemArrPosI = itemData.arrPosition.i;
                            itemArrPosJ = scope.itemArrPosJ = itemController.itemArrPosJ = itemData.arrPosition.j;
                            let item = ItemDataFactory.getItem(itemNumber).data;
                            targetId = angular.element(document.querySelector('#' + attrs.targetId + itemNumber));

                            let targetCustomId = angular.element(document.querySelector('#item' + itemNumber));
                            let dropZoneGridItems = angular.element(targetCustomId[0].querySelectorAll('.custom-drop-zone-grid-item'));

                            if (targetId.length === 0 && callerId !== null) {
                                let customItemNumber = 0;
                                for (let i = 0; i < dropZoneGridItems.length; i++) {
                                    if (parseInt(angular.element(dropZoneGridItems[i]).attr('item-number')) === callerId) {
                                        customItemNumber = callerId;
                                    }
                                }
                                targetId = angular.element(document.querySelector('#' + attrs.targetId + itemNumber + 'grid' + customItemNumber));
                                if (!element.parent().parent().parent().attr('target-id')) {
                                    element.parent().parent().parent().attr('target-id', '#' + attrs.targetId + itemNumber + 'grid' + customItemNumber);
                                }
                                // console.log('targetId  ', targetId)
                            }
                        }
                        else {
                            // console.log('getCustomTargets')
                            getCustomTargets();
                        }

                        function getCustomTargets() {
                            let itemsCount = angular.element(document.querySelectorAll('.item'));
                            let pagesCountCheck = angular.element(document.querySelectorAll('.page')).length;

                            // Check if targetID's are in the DOM, changing pages removes some nodes
                            if (targetId.length === itemsCount.length) {
                                for (let k = 0; k < targetId.length; k++) {
                                    if (columnA[0].contains(targetId[k]) === false) {
                                        break;
                                    }
                                    else if (columnA[0].contains(targetId[k]) === true && k === targetId.length - 1) {
                                        return;
                                    }
                                }
                            }
                            // if (pagesCountCheck === pagesCount && itemsCount.length === targetId.length) {
                            //     return;
                            // }
                            // pagesCount = pagesCountCheck;
                            // console.log('reset targetId')
                            targetId = [];
                            let item1 = angular.element(document.querySelectorAll('#item1'));
                            // let customImagesCount = angular.element(item1[0].querySelectorAll('img'));
                            // let customTextCount = angular.element(item1[0].querySelectorAll('.my-text'));

                            // angular.element(function () {
                            customTargetId = null;
                            if (attrs.type !== 'file') {
                                customTargetId = element.parent().parent().parent().attr('target-id');
                            }
                            else {
                                customTargetId = element.parent().parent().parent().parent().parent().attr('target-id');
                            }

                            for (let i = 1; i <= itemsCount.length; i++) {
                                let temp = angular.element(document.querySelectorAll('#' + attrs.targetId + i + 'grid' + customTargetId));
                                if (temp.length > 0) {
                                    targetId.push(temp[0]);
                                }
                            }
                            // console.log('itemsCount.length', itemsCount.length)
                            // console.log('targetId.length  ', targetId)
                            // console.log('targetId  ', targetId)
                            // })
                        }

                        if (attrs.property === 'filter') {
                            switch (filter) {
                                case 'blur': units = 'px'; break;
                                case 'brightness':
                                case 'sepia':
                                case 'contrast': units = '%'; break;
                                case 'hue-rotate': units = 'deg'; break;
                                default: break;
                            }
                            scope[attrs.model + 'units'] = units;
                        }
                        if (attrs.property === 'transform') {
                            switch (propertyValue) {
                                case 'rotate': units = 'deg'; break;
                                default: break;
                            }
                            scope[attrs.model + 'units'] = units;
                        }
                        if (attrs.property === 'borderWidth') {
                            scope[attrs.model + 'units'] = 'px';
                        }

                        scope[attrs.model + 'change'] = function (val) {
                            if (!itemController) {
                                getCustomTargets();
                            }
                            switch (attrs.property) {
                                case 'filter': cahngeFilter(val); break;
                                case 'transform': transform(val); break;
                                case 'left': left(val); scope[attrs.model + 'units'] = '%'; break;
                                case 'bottom': bottom(val); scope[attrs.model + 'units'] = '%'; break;
                                case 'width': width(val); scope[attrs.model + 'units'] = '%'; break;
                                case 'fontSize': fontSize(val); scope[attrs.model + 'units'] = 'px'; break;
                                case 'color': fontColor(val); break;
                                case 'backgroundColor': backgroundColor(val); break;
                                case 'borderColor': borderColor(val); break;
                                case 'borderWidth': borderWidth(val); break;
                                case 'innerText': innerText(val); break;
                                default: break;
                            }
                        }

                        function cahngeFilter(val) {

                            let currentFilterString = targetId[0].style.filter;
                            let res = '';
                            if (oldString === '') {
                                newString = filter + "(" + val + units + ")";
                                for (let i = 0; i < targetId.length; i++) {
                                    targetId[i].style.webkitFilter = currentFilterString + newString;
                                    saveFilterStr(i);
                                }
                                oldString = newString;
                            }
                            else {
                                newString = filter + "(" + val + units + ")";
                                res = currentFilterString.replace(oldString, newString);
                                for (let i = 0; i < targetId.length; i++) {
                                    targetId[i].style.webkitFilter = res;
                                    saveFilterStr(i);
                                }
                                oldString = newString;
                            }
                            function saveFilterStr(i) {
                                // if (itemController) {
                                // ItemDataFactory.saveItemCss(res, itemArrPosI, itemArrPosJ, 'filter');
                                let gridItem = attrs.targetId + targetId[i].id.match(/\d+$/)[0];
                                let valString = res;
                                ItemDataFactory.saveItemStyle(valString, itemArrPosI, itemArrPosJ, attrs.property, attrs.propertyValue, gridItem);
                                // }
                            }

                            // let currentFilterString = targetId[0].style.filter;
                            // let res = '';
                            // if (oldString === '') {
                            //     newString = filter + "(" + val + units + ")";
                            //     targetId[0].style.webkitFilter = currentFilterString + newString;
                            //     oldString = newString;
                            // } else {
                            //     newString = filter + "(" + val + units + ")";
                            //     res = currentFilterString.replace(oldString, newString);
                            //     targetId[0].style.webkitFilter = res;
                            //     oldString = newString;
                            // }
                            // if (itemController) {
                            //     ItemDataFactory.saveItemCss(res, itemArrPosI, itemArrPosJ, 'filter');
                            // }
                        }

                        function transform(val) {
                            for (let i = 0; i < targetId.length; i++) {
                                targetId[i].style.transform = attrs.propertyValue + '(' + val + units + ')';
                                let gridItem = attrs.targetId + targetId[i].id.match(/\d+$/)[0];
                                // if (itemController) {
                                // ItemDataFactory.saveItemCss(val, itemArrPosI, itemArrPosJ, attrs.propertyValue);
                                let valString = attrs.propertyValue + '(' + val + units + ')';
                                ItemDataFactory.saveItemStyle(valString, itemArrPosI, itemArrPosJ, attrs.property, attrs.propertyValue, gridItem);
                                // }
                            }
                        }

                        function left(val) {
                            for (let i = 0; i < targetId.length; i++) {
                                targetId[i].style.left = val + '%';
                                // if (itemController) {
                                // ItemDataFactory.saveItemCss(val, itemArrPosI, itemArrPosJ, attrs.propertyValue);
                                let gridItem = attrs.targetId + targetId[i].id.match(/\d+$/)[0];
                                let valString = val + '%';
                                ItemDataFactory.saveItemStyle(valString, itemArrPosI, itemArrPosJ, attrs.property, attrs.propertyValue, gridItem);
                                // }
                            }
                            // targetId[0].style.left = val + '%';
                            // ItemDataFactory.saveItemCss(val, itemArrPosI, itemArrPosJ, attrs.propertyValue);
                        }
                        function bottom(val) {
                            for (let i = 0; i < targetId.length; i++) {
                                targetId[i].style.bottom = val + '%';
                                // if (itemController) {
                                // ItemDataFactory.saveItemCss(val, itemArrPosI, itemArrPosJ, attrs.propertyValue);
                                let gridItem = attrs.targetId + targetId[i].id.match(/\d+$/)[0];
                                let valString = val + '%';
                                ItemDataFactory.saveItemStyle(valString, itemArrPosI, itemArrPosJ, attrs.property, attrs.propertyValue, gridItem);
                                // }
                            }
                            // targetId[0].style.bottom = val + '%';
                            // ItemDataFactory.saveItemCss(val, itemArrPosI, itemArrPosJ, attrs.propertyValue);
                        }
                        function width(val) {
                            for (let i = 0; i < targetId.length; i++) {
                                targetId[i].style.width = val + '%';
                                // if (itemController) {
                                // ItemDataFactory.saveItemCss(val, itemArrPosI, itemArrPosJ, attrs.propertyValue);
                                let gridItem = attrs.targetId + targetId[i].id.match(/\d+$/)[0];
                                let valString = val + '%';
                                ItemDataFactory.saveItemStyle(valString, itemArrPosI, itemArrPosJ, attrs.property, attrs.propertyValue, gridItem);
                                // }
                            }
                            // targetId[0].style.width = val + '%';
                            // ItemDataFactory.saveItemCss(val, itemArrPosI, itemArrPosJ, attrs.propertyValue);
                        }
                        function fontSize(val) {
                            for (let i = 0; i < targetId.length; i++) {
                                targetId[i].style.fontSize = val + 'px';
                                // if (itemController) {
                                // ItemDataFactory.saveItemCss(val, itemArrPosI, itemArrPosJ, attrs.propertyValue);
                                let gridItem = attrs.targetId + targetId[i].id.match(/\d+$/)[0];
                                let valString = val + 'px';
                                ItemDataFactory.saveItemStyle(valString, itemArrPosI, itemArrPosJ, attrs.property, attrs.propertyValue, gridItem);
                                // }
                            }
                            // targetId[0].style.fontSize = val + 'px';
                            // ItemDataFactory.saveItemCss(val, itemArrPosI, itemArrPosJ, attrs.propertyValue);
                        }
                        function fontColor(val) {
                            for (let i = 0; i < targetId.length; i++) {
                                targetId[i].style.color = val;
                                // if (itemController) {
                                // ItemDataFactory.saveItemCss(val, itemArrPosI, itemArrPosJ, attrs.propertyValue);
                                let gridItem = attrs.targetId + targetId[i].id.match(/\d+$/)[0];
                                let valString = val;
                                ItemDataFactory.saveItemStyle(valString, itemArrPosI, itemArrPosJ, attrs.property, attrs.propertyValue, gridItem);
                                // }
                            }
                            // targetId[0].style.color = val;
                            // ItemDataFactory.saveItemCss(val, itemArrPosI, itemArrPosJ, attrs.propertyValue);
                        }
                        function backgroundColor(val) {
                            for (let i = 0; i < targetId.length; i++) {
                                angular.element(targetId[i]).parent().parent()[0].style.backgroundColor = val;
                                // if (itemController) {
                                // ItemDataFactory.saveItemCss(val, itemArrPosI, itemArrPosJ, attrs.propertyValue);
                                let gridItem = attrs.targetId + targetId[i].id.match(/\d+$/)[0];
                                let valString = val;
                                ItemDataFactory.saveItemStyle(valString, itemArrPosI, itemArrPosJ, attrs.property, attrs.propertyValue, gridItem, true);
                                // }
                            }
                            // targetId.parent().parent()[0].style.backgroundColor = val;
                            // ItemDataFactory.saveItemCss(val, itemArrPosI, itemArrPosJ, attrs.propertyValue);
                        }
                        function borderColor(val) {
                            console.log(targetId)
                            for (let i = 0; i < targetId.length; i++) {
                                // angular.element(targetId[i]).parent().parent()[0].style.borderColor = val;
                                angular.element(targetId[i]).parent()[0].style.borderColor = val;
                                // if (itemController) {
                                // ItemDataFactory.saveItemCss(val, itemArrPosI, itemArrPosJ, attrs.propertyValue);
                                let gridItem = attrs.targetId + targetId[i].id.match(/\d+$/)[0];
                                let valString = val;
                                ItemDataFactory.saveItemStyle(valString, itemArrPosI, itemArrPosJ, attrs.property, attrs.propertyValue, gridItem, true);
                                // }
                            }
                            // targetId.parent().parent()[0].style.borderColor = val;
                            // ItemDataFactory.saveItemCss(val, itemArrPosI, itemArrPosJ, attrs.propertyValue);
                        }
                        function borderWidth(val) {
                            console.log(targetId)
                            for (let i = 0; i < targetId.length; i++) {
                                // angular.element(targetId[i]).parent().parent()[0].style.borderWidth = val + 'px';
                                angular.element(targetId[i]).parent()[0].style.borderWidth = val + 'px';
                                // if (itemController) {
                                // ItemDataFactory.saveItemCss(val, itemArrPosI, itemArrPosJ, attrs.propertyValue);
                                let gridItem = attrs.targetId + targetId[i].id.match(/\d+$/)[0];
                                let valString = val + 'px';
                                ItemDataFactory.saveItemStyle(valString, itemArrPosI, itemArrPosJ, attrs.property, attrs.propertyValue, gridItem, true);
                                // }
                            }
                            // targetId.parent().parent()[0].style.borderWidth = val+'px';
                            // ItemDataFactory.saveItemCss(val, itemArrPosI, itemArrPosJ, attrs.propertyValue);
                        }
                        function innerText(val) {
                            for (let i = 0; i < targetId.length; i++) {
                                targetId[i].innerText = val;
                                // if (itemController) {
                                // ItemDataFactory.saveItemCss(val, itemArrPosI, itemArrPosJ, attrs.propertyValue);
                                let gridItem = attrs.targetId + targetId[i].id.match(/\d+$/)[0];
                                let valString = val;
                                ItemDataFactory.saveItemText(valString, itemArrPosI, itemArrPosJ, attrs.property, attrs.propertyValue, gridItem, i + 1);
                                // }
                            }
                            // targetId[0].innerText = val;
                            // targetId.parent().parent()[0].style.borderWidth = val+'px';
                            // ItemDataFactory.saveItemCss(val, itemArrPosI, itemArrPosJ, attrs.propertyValue);
                        }

                        if (attrs.type === 'file') {
                            // var input = angular.element(element[0].querySelector('#itemImageInput'));
                            var input = element;

                            if (itemController) {
                                input.on('change', function (event) {
                                    let itemArrPosI = itemController.itemArrPosI; let itemArrPosJ = itemController.itemArrPosJ;
                                    scope.isLocked = true;
                                    ItemDataFactory.saveItem(true, itemArrPosI, itemArrPosJ, 'isLocked');

                                    ImageReaderFactory.readFile(event, true).then(function (data) {
                                        // ItemDataFactory.saveItem(data.blob, itemArrPosI, itemArrPosJ, 'img');
                                        // ItemDataFactory.saveItem(true, itemArrPosI, itemArrPosJ, 'imgIsLocked');

                                        let gridItem = attrs.targetId + targetId[0].id.match(/\d+$/)[0];
                                        let valString = data.blob;
                                        ItemDataFactory.saveItemImgSrc(valString, itemArrPosI, itemArrPosJ, attrs.property, attrs.propertyValue, gridItem);

                                        scope.fileName = data.name;

                                        targetId[0].src = data.blob;
                                        angular.element(targetId[0]).css({ maxHeight: 'unset', padding: 'unset' });

                                        // ImageReaderFactory.createCanvas(data.blob, itemNumber).then(function (canvas) {
                                        //     console.log(canvas);
                                        //     console.log(targetId[0]);
                                        //     // angular.element(document.querySelector("#img" + itemNumber))[0].replaceWith(canvas);
                                        //     targetId[0].replaceWith(canvas);
                                        // })
                                    })
                                });
                            }
                            else {
                                // angular.element(function() {
                                input.on('change', function (event) {
                                    event.preventDefault();
                                    getCustomTargets();
                                    ImageReaderFactory.readFile(event, true).then(function (data) {
                                        // ItemDataFactory.saveItem(data.blob, itemArrPosI, itemArrPosJ, 'img');
                                        // ItemDataFactory.saveItem(true, itemArrPosI, itemArrPosJ, 'imgIsLocked');
                                        // scope.fileName = data.name;
                                        // console.log(targetId);
                                        for (let i = 0; i < targetId.length; i++) {
                                            if (data[i] && data.length !== 'undefined') {
                                                targetId[i].src = data[i].$$state.value.blob;
                                                angular.element(targetId[i]).css({ maxHeight: 'unset', padding: 'unset' });
                                                let gridItem = attrs.targetId + targetId[i].id.match(/\d+$/)[0];
                                                ItemDataFactory.saveImgSrc(data[i].$$state.value.blob, itemArrPosI, itemArrPosJ, gridItem, i + 1);
                                            }
                                            else {
                                                targetId[i].src = data.blob;
                                                angular.element(targetId[i]).css({ maxHeight: 'unset', padding: 'unset' });
                                                let gridItem = attrs.targetId + targetId[i].id.match(/\d+$/)[0];
                                                ItemDataFactory.saveImgSrc(data.blob, itemArrPosI, itemArrPosJ, gridItem);
                                            }
                                        }
                                    })
                                });
                                // })
                            }

                        }

                    }
                    // ,post: function(){
                    //     // console.log('post myInput')
                    // }
                }
            }
        }
    }]);

    app.directive('item', ['$compile', 'ItemDataFactory', '$templateRequest', function ($compile, ItemDataFactory, $templateRequest) {
        return {
            restrict: 'A',
            transclude: false,
            remplace: false,
            scope: {
                template: '=',
                itemNumber: '='
            },
            controllerAs: 'itemController',
            bindToController: true,
            template: '<template></template>',
            controller: [function () {

                var itemController = this;
                itemController.$onInit = onInit;
                function onInit() {
                    const itemNumber = itemController.itemNumber;
                    const template = itemController.template;
                }
            }],
            compile: function (telement, tattrs) {
                return {
                    pre: function (iscope, ielement, iattrs, iitemController) {

                        let itemData = ItemDataFactory.getItem(iitemController.itemNumber);
                        let template = angular.element(ielement[0].querySelector('template'));
                        let templateNumber = iitemController.template;

                        if (itemData.data.isCustom && !itemData.data.isTest) {
                            // template.replaceWith($compile(itemData.data.template)(iscope));
                            $templateRequest("custom-templates/custom_template_test" + templateNumber + ".html").then(function (html) {
                                let newTemplate = angular.element(html);
                                // console.log(html)
                                template.replaceWith($compile(newTemplate)(iscope));
                                // if (iitemController.itemNumber === 1){
                                //     angular.element(function () {
                                //         iscope.$emit('cagada', '💩');
                                //     })
                                // }
                            });
                        }
                        else if (itemData.data.isTest) {
                            template.replaceWith($compile(itemData.data.template)(iscope));
                        }
                        else if (itemData.data.isCustom === false) {
                            template.replaceWith($compile('<' + itemData.data.template + '></' + itemData.data.template + '>')(iscope));
                        }

                        iscope.$on('$destroy', function () {
                            console.log('itemSelect ' + 'itemNumber' + ' scope destroyed');
                            // let targetId = '#img' + itemController.itemNumber + 'grid' + myImageController.callerId;
                            let itemToolbox = angular.element(document.querySelector('#itemToolbox' + iitemController.itemNumber));
                            itemToolbox.remove();

                            if (iitemController.itemNumber === 1) {
                                const toolboxClone = angular.element(document.querySelector('#toolboxClone'));
                                toolboxClone.contents().remove();
                            }
                        })
                        ielement.on('$destroy', function () {
                            console.log('itemSelect ' + 'itemNumber' + ' element destroyed');
                        })

                    }
                    // ,post: function() {

                    // }
                }
            }
            // link: function (scope, element, attrs, itemController) {
            //     let itemData = ItemDataFactory.getItem(itemController.itemNumber);
            //     let template = angular.element(element[0].querySelector('template'));
            //     template.replaceWith($compile('<' + itemData.data.template + '></' + itemData.data.template+'>')(scope));
            // }
        }
    }]);

    app.directive('modalSelectTemplate', ['$compile', 'ItemDataFactory', '$templateRequest', function ($compile, ItemDataFactory, $templateRequest) {
        return {
            restrict: 'E',
            transclude: false,
            remplace: false,
            scope: false,
            templateUrl: 'modalSelectTemplate.html',
            controller: [function () {
                let controller = this;
                controller.$onInit = onInit;
                function onInit() {
                    const itemNumber = controller.itemNumber;
                    const template = controller.template;
                }
            }],
            compile: function (telement, tattrs) {
                return {
                    post: function (iscope, ielement, iattrs, iitemController) {

                        let items = [0, 1, 2, 4, 5, 6];
                        iscope.items = items;

                        let modalSelectTemplate = angular.element(ielement[0].querySelector('#modalSelectTemplate'));

                        iscope.closeModalbtn = function () {
                            modalSelectTemplate.removeClass('is-active');
                        }

                        angular.element(function () {

                            for (let i = 0; i < items.length; i++) {
                                let modalItem = angular.element(ielement[0].querySelector('#modalItem' + i));

                                $templateRequest("custom-templates/custom_template_test" + i + ".html").then(function (html) {
                                    let newTemplate = angular.element(html);
                                    console.log(newTemplate[0]);

                                    let myImageArr = angular.element(newTemplate[0].querySelectorAll('my-image'));
                                    let myTextArr = angular.element(newTemplate[0].querySelectorAll('my-text'));

                                    let imgString = angular.element('<img src="images/img_placeholder3.svg" id="img2grid1" style="position: absolute; max-width: none; width: 100%; transform: rotate(0deg); mix-blend-mode: multiply; left: 0%; bottom: unset; max-height: 100%; padding: 20%;">');
                                    let textString = angular.element('<p>My Text</p>');

                                    for (let i = 0; i < myImageArr.length; i++) {
                                        angular.element(myImageArr[i]).parent().css({ border: '3px solid #db7093' });
                                        let imgStringCopy = angular.copy(imgString);
                                        myImageArr[i].replaceWith(imgStringCopy[0]);
                                    }
                                    for (let i = 0; i < myTextArr.length; i++) {
                                        angular.element(myTextArr[i]).parent().css({ border: '3px solid #db7093' });
                                        let textStringCopy = angular.copy(textString);
                                        myTextArr[i].replaceWith(textStringCopy[0]);
                                    }
                                    modalItem.append(newTemplate);

                                    // let compiledElement = $compile(newTemplate)(iscope);
                                    // console.log(compiledElement[0]);
                                    // modalItem.append(compiledElement);
                                    // angular.element(function(){
                                    //     let myImageToolbox = angular.element(compiledElement[0].querySelectorAll('my-image-toolbox'));
                                    //     let myTextToolbox = angular.element(compiledElement[0].querySelectorAll('my-text-toolbox'));
                                    //     myImageToolbox.remove();
                                    //     myTextToolbox.remove();
                                    //     console.log(myImageToolbox)
                                    //     console.log(myTextToolbox)
                                    // })
                                });
                            }

                        })

                        iscope.$on('$destroy', function () {
                            console.log('itemSelect ' + 'itemNumber' + ' scope destroyed');
                        })
                        ielement.on('$destroy', function () {
                            console.log('itemSelect ' + 'itemNumber' + ' element destroyed');
                        })

                    }
                    // ,post: function() {

                    // }
                }
            }
        }
    }]);

    app.directive('itemSelect', ['$compile', 'ItemDataFactory', '$templateRequest', function ($compile, ItemDataFactory, $templateRequest) {
        return {
            restrict: 'EA',
            scope: false,
            require: 'item',
            link: function (scope, element, attrs, itemController) {

                let itemNumber = itemController.itemNumber;
                let template = itemController.template;

                let overlay = $compile('<div class="overlay dont-print-me"><div class="text">Item ' + itemNumber + '</div></div>')(scope);
                element.append(overlay);

                // console.log(angular.element(document.querySelector('#itemToolboxCAGADA')))
                // if ( angular.element(document.querySelector('#itemToolbox')).length === 0 ) {
                // $templateRequest("itemToolboxWrapper.html").then(function (html) {
                //     let template = angular.element(html);
                //     // template[0].id = 'itemToolbox';
                //     // template[0].id = 'itemToolbox' + itemController.itemNumber;
                //     let itemToolBoxIncludeWrapper = angular.element(document.querySelector('#itemToolBoxIncludeWrapper'));
                //     itemToolBoxIncludeWrapper.append(template);
                //     $compile(template)(scope);
                // });
                // }

                // const imageWrapperElement = angular.element(element[0].children[0].querySelector('.imageWrapper'));
                const imageWrapperElement = element;

                imageWrapperElement.on('mouseover', function (event) {
                    if (!element.hasClass('selected')) {
                        overlay.addClass('show-overlay');
                    }
                });
                imageWrapperElement.on('mouseout', function (event) {
                    overlay.removeClass('show-overlay');
                });

                imageWrapperElement.on('click', function (event) {

                    if (!element.hasClass('selected')) {

                        // // angular.element(document.querySelectorAll('#itemToolBoxIncludeWrapper')).remove();
                        // // angular.element(document.querySelector('#itemToolBoxIncludeWrapper')).detach();

                        // let itemToolBox = $compile("<div id='itemToolBoxIncludeWrapper'><ng-include src=\"'itemToolBox.html'\" onload=\"onload()\"></ng-include></div>")(scope);
                        // // let itemToolBox = $compile($templateCache.get('itemTB.html'))(scope);
                        // elementToolsElement.append(itemToolBox);

                        // scope.itemId = itemNumber;

                        angular.element(document.querySelector('#itemToolBoxIncludeWrapper')).removeClass('hideBlock');

                        angular.element(document.querySelector('.item-tool-box-is-visible')).addClass('hideBlock');
                        angular.element(document.querySelector('.item-tool-box-is-visible')).removeClass('item-tool-box-is-visible');

                        // angular.element(document.querySelector('#'+template+'ToolBox' + itemNumber)).removeClass('hideBlock');
                        // angular.element(document.querySelector('#'+template+'ToolBox' + itemNumber)).addClass('item-tool-box-is-visible');

                        angular.element(document.querySelector('#itemToolbox' + itemNumber)).removeClass('hideBlock');
                        angular.element(document.querySelector('#itemToolbox' + itemNumber)).addClass('item-tool-box-is-visible');

                        angular.element(document.querySelectorAll('.selected')).removeClass('selected');
                        element.addClass('selected');
                        overlay.removeClass('show-overlay');
                    }

                });

                var pageElement = angular.element(document.querySelectorAll('.navbar'));
                pageElement.on('click', function (event) {
                    angular.element(document.querySelectorAll('.selected')).removeClass('selected');
                    angular.element(document.querySelector('#tools')).removeClass('hideBlock');
                    angular.element(document.querySelector('#itemToolBoxIncludeWrapper')).addClass('hideBlock');
                });

                scope.close = function () {
                    angular.element(document.querySelectorAll('.selected')).removeClass('selected');
                    angular.element(document.querySelector('#tools')).removeClass('hideBlock');
                    angular.element(document.querySelector('#itemToolBoxIncludeWrapper')).addClass('hideBlock');
                }

                scope.$on('$destroy', function () {
                    // console.log('itemSelect ' + itemNumber + ' scope destroyed');
                    // angular.element(document.querySelector('#itemToolBox' + itemNumber)).remove();
                })
                element.on('$destroy', function () {
                    // console.log('itemSelect ' + itemNumber + ' element destroyed');
                })

            }
        }
    }]);

    app.directive('template1', ['$compile', 'ItemDataFactory', '$timeout', '$templateCache', function ($compile, ItemDataFactory, $timeout, $templateCache) {
        return {
            restrict: 'AE',
            require: '^item',
            // scope: {
            //     template: '=',
            //     itemNumber: '=',
            // },
            // controllerAs: 'vm',
            // bindToController: true,
            // controller: function () {
            //     // var vm = this;
            //     // vm.min = 3;
            //     // vm.$onInit = onInit;
            //     // function onInit() {
            //     // }
            // },
            templateUrl: 'template1/template1.html',
            link: function (scope, element, attrs, itemController) {

                // scope input functions-----------------------------------------------------------
                itemController.chageObjectFitCss = chageObjectFitCss;
                itemController.chageDivitionSizeCss = chageDivitionSizeCss;
                itemController.chageFontSizeCss = chageFontSizeCss;
                itemController.chageBorderWidthCss = chageBorderWidthCss;
                itemController.chageBorderColorCss = chageBorderColorCss;
                itemController.chageImage = chageImage;
                // --------------------------------------------------------------------------------

                // let itemNumber = scope.itemController.outerIndex * scope.itemController.itemsArr[0].length + scope.itemController.sindex + 1;
                // const itemNumber = scope.itemController.itemNumber;
                const itemNumber = itemController.itemNumber;

                scope.itemData = {};

                let itemData = ItemDataFactory.getItem(itemNumber);

                let itemArrPosI = scope.itemArrPosI = itemController.itemArrPosI = itemData.arrPosition.i;
                let itemArrPosJ = scope.itemArrPosJ = itemController.itemArrPosJ = itemData.arrPosition.j;

                let isLocked = itemData.data.isLocked;
                let imgSrc = itemData.data.img;

                const imgAttrs = angular.element(element[0].querySelector('.imageWrapper'));
                imgAttrs[0].children[0].attributes.id.value = 'img' + itemNumber;
                imgAttrs[0].children[0].attributes.src.value = imgSrc;

                let elementObjectFitSelect = itemData.data.css.elementObjectFitSelect;
                let elementDivitionSize = itemData.data.css.elementDivitionSize;
                let elementFontSize = itemData.data.css.elementFontSize;
                let elementBorderWidth = itemData.data.css.elementBorderWidth;
                let elementBorderColor = itemData.data.css.elementBorderColor;
                let elementName = itemData.data.name;

                // Fill scope inputs with factory data---------------------------------------------
                scope.isLocked = isLocked;
                scope.itemData.elementObjectFitSelect = elementObjectFitSelect == 'var(--object-fit)' ? 'cover' : elementObjectFitSelect;
                scope.itemData.elementDivitionSize = typeof elementDivitionSize === 'string' ? 80 : elementDivitionSize;
                scope.itemData.elementFontSize = typeof elementFontSize === 'string' ? 60 : elementFontSize;
                scope.itemData.elementBorderWidth = typeof elementBorderWidth === 'string' ? 2 : elementBorderWidth;
                scope.itemData.elementBorderColor = (elementBorderColor == 'var(--border-color)' ? '#ff1493' : elementBorderColor);
                scope.itemData.name = elementName;
                // --------------------------------------------------------------------------------

                const elementToolsElement = angular.element(document.querySelector('#elementTools'));

                const textBox = angular.element(element[0].querySelector('.text-box'));
                const textArea = angular.element(textBox)[0].children[0];
                const imageWrapper = angular.element(element[0].querySelector('.imageWrapper'));
                const image = angular.element(element[0].querySelector('.imageWrapper').children[0]);
                const elementParent = element.parent();

                // const elementTextBox = angular.element(textBox);
                const elementTextArea = angular.element(textArea);

                image.css({ objectFit: elementObjectFitSelect })
                textBox.css({ height: (typeof elementDivitionSize === 'string' ? elementDivitionSize : elementDivitionSize + '%') })
                textBox.css({ height: (typeof elementDivitionSize === 'string' ? (100 - parseInt(elementDivitionSize)) : (100 - elementDivitionSize) + '%') })
                elementTextArea.css({ fontSize: (typeof elementFontSize === 'string' ? elementFontSize : elementFontSize + 'px') })
                elementParent.css({ borderWidth: (typeof elementBorderWidth === 'string' ? elementBorderWidth : elementBorderWidth + 'px') })
                textBox.css({ borderTopWidth: (typeof elementBorderWidth === 'string' ? elementBorderWidth : elementBorderWidth + 'px') })
                elementParent.css({ borderColor: elementBorderColor })
                textBox.css({ borderColor: elementBorderColor })

                function chageObjectFitCss(value) {
                    console.log('chageObjectFitCss')
                    image.css({ objectFit: value })
                    ItemDataFactory.saveItemCss(value, itemArrPosI, itemArrPosJ, 'elementObjectFitSelect');
                }
                function chageDivitionSizeCss(value) {
                    console.log('chageDivitionSizeCss')
                    imageWrapper.css({ height: value + '%' })
                    textBox.css({ height: (100 - value) + '%' })
                    ItemDataFactory.saveItemCss(value, itemArrPosI, itemArrPosJ, 'elementDivitionSize');
                }
                function chageFontSizeCss(value) {
                    console.log('chageFontSizeCss')
                    elementTextArea.css({ fontSize: value + 'px' })
                    ItemDataFactory.saveItemCss(value, itemArrPosI, itemArrPosJ, 'elementFontSize');
                }
                function chageBorderWidthCss(value) {
                    console.log('chageBorderWidthCss')
                    elementParent.css({ borderWidth: value + 'px' })
                    textBox.css({ borderTopWidth: value + 'px' })
                    ItemDataFactory.saveItemCss(value, itemArrPosI, itemArrPosJ, 'elementBorderWidth');
                }
                function chageBorderColorCss(value) {
                    console.log('chageBorderColorCss')
                    elementParent.css({ borderColor: value })
                    textBox.css({ borderColor: value })
                    ItemDataFactory.saveItemCss(value, itemArrPosI, itemArrPosJ, 'elementBorderColor');
                }
                function chageName(value) {
                    console.log('chageImage')
                    ItemDataFactory.saveItem(value, itemArrPosI, itemArrPosJ, 'name');
                }
                function chageImage(val) {
                    console.log('chageImage ', val)
                }

                scope.$on('$destroy', function () {
                    console.log('template1 ' + itemNumber + ' scope destroyed');
                    angular.element(document.querySelector('#template1ToolBox' + itemNumber)).remove();
                })
                element.on('$destroy', function () {
                    console.log('template1 ' + itemNumber + ' element destroyed');
                })

            }
        }
    }]);

    app.directive('template1ToolBox', ['ImageReaderFactory', 'ItemDataFactory', function (ImageReaderFactory, ItemDataFactory) {
        return {
            restrict: 'EA',
            transclude: false,
            replace: false,
            scope: false,
            require: ['^^?template1', '^item'],
            templateUrl: 'template1/template1ToolBox.html',
            link: function (scope, element, attrs, controllers) {

                let template1Controller = controllers[0];
                let itemController = controllers[1];
                let itemNumber = itemController.itemNumber;

                scope.itemId = itemNumber;

                // element.addClass('hideBlock');

                element.attr('id', 'template1ToolBox' + itemNumber);

                // const elementToolsElement = angular.element(document.querySelector('#itemToolBoxIncludeWrapper'));
                // elementToolsElement.append(element);

                const itemToolboxCard = angular.element(document.querySelector('#itemToolboxCard' + itemController.itemNumber));
                itemToolboxCard.append(element);


                scope.elementObjectFitSelect = function (val) {
                    let itemArrPosI = itemController.itemArrPosI; let itemArrPosJ = itemController.itemArrPosJ;
                    scope.isLocked = true;
                    ItemDataFactory.saveItem(true, itemArrPosI, itemArrPosJ, 'isLocked');
                    itemController.chageObjectFitCss(val);
                }
                scope.elementDivitionSize = function (val) {
                    let itemArrPosI = itemController.itemArrPosI; let itemArrPosJ = itemController.itemArrPosJ;
                    scope.isLocked = true;
                    ItemDataFactory.saveItem(true, itemArrPosI, itemArrPosJ, 'isLocked');
                    itemController.chageDivitionSizeCss(val);
                }
                scope.elementFontSize = function (val) {
                    let itemArrPosI = itemController.itemArrPosI; let itemArrPosJ = itemController.itemArrPosJ;
                    scope.isLocked = true;
                    ItemDataFactory.saveItem(true, itemArrPosI, itemArrPosJ, 'isLocked');
                    itemController.chageFontSizeCss(val);
                }
                scope.elementBorderWidth = function (val) {
                    let itemArrPosI = itemController.itemArrPosI; let itemArrPosJ = itemController.itemArrPosJ;
                    scope.isLocked = true;
                    ItemDataFactory.saveItem(true, itemArrPosI, itemArrPosJ, 'isLocked');
                    itemController.chageBorderWidthCss(val);
                }
                scope.elementBorderColor = function (val) {
                    let itemArrPosI = itemController.itemArrPosI; let itemArrPosJ = itemController.itemArrPosJ;
                    scope.isLocked = true;
                    ItemDataFactory.saveItem(true, itemArrPosI, itemArrPosJ, 'isLocked');
                    itemController.chageBorderColorCss(val);
                }

                var input = angular.element(element[0].querySelector('#itemImageInput'));
                input.on('change', function (event) {
                    let itemArrPosI = itemController.itemArrPosI; let itemArrPosJ = itemController.itemArrPosJ;
                    scope.isLocked = true;
                    ItemDataFactory.saveItem(true, itemArrPosI, itemArrPosJ, 'isLocked');

                    ImageReaderFactory.readFile(event, true).then(function (data) {
                        ItemDataFactory.saveItem(data.blob, itemArrPosI, itemArrPosJ, 'img');
                        ItemDataFactory.saveItem(true, itemArrPosI, itemArrPosJ, 'imgIsLocked');
                        scope.fileName = data.name;
                        ImageReaderFactory.createCanvas(data.blob, itemNumber).then(function (canvas) {
                            console.log(canvas);
                            angular.element(document.querySelector("#img" + itemNumber))[0].replaceWith(canvas);
                        })
                    })
                });

                scope.close = function () {
                    angular.element(document.querySelectorAll('.selected')).removeClass('selected');
                    angular.element(document.querySelector('#tools')).removeClass('hideBlock');
                    angular.element(document.querySelector('#itemToolBoxIncludeWrapper')).addClass('hideBlock');
                }

                element.scope().$on('$destroy', function () {
                    console.log('template1ToolBox ' + itemNumber + ' scope destroyed');
                })
                element.on('$destroy', function () {
                    console.log('template1ToolBox ' + itemNumber + ' element destroyed');
                })
            }
        }
    }]);

    app.directive('template2', ['$compile', 'ItemDataFactory', '$timeout', '$templateCache', 'ImageReaderFactory', function ($compile, ItemDataFactory, $timeout, $templateCache, ImageReaderFactory) {
        return {
            restrict: 'AE',
            require: '^item',
            scope: false,
            templateUrl: 'template2/template2.html',
            link: function (scope, element, attrs, itemController) {

                // scope input functions-----------------------------------------------------------
                itemController.t2BorderImageSizeCss = t2BorderImageSizeCss;
                itemController.t2BackgroundBorderRadiusCss = t2BackgroundBorderRadiusCss;
                itemController.t2BackgroundWidthCss = t2BackgroundWidthCss;
                itemController.t2BackgroundHeightCss = t2BackgroundHeightCss;
                itemController.t2BackgroundColorCss = t2BackgroundColorCss;
                itemController.t2FrontImageSizeCss = t2FrontImageSizeCss;
                itemController.t2FrontImagePosXCss = t2FrontImagePosXCss;
                itemController.t2FrontImagePosYCss = t2FrontImagePosYCss;
                itemController.t2FrontImageSliderCss = t2FrontImageSliderCss;
                itemController.t2FrontImage = t2FrontImage;
                itemController.t2FontSizeCss = t2FontSizeCss;
                itemController.t2BorderWidthCss = t2BorderWidthCss;
                itemController.t2BorderColorCss = t2BorderColorCss;
                itemController.t2Image = t2Image;
                itemController.t2TextPosXCss = t2TextPosXCss;
                itemController.t2TextPosYCss = t2TextPosYCss;
                // --------------------------------------------------------------------------------

                const itemNumber = itemController.itemNumber;

                scope.itemData = {};

                let itemData = ItemDataFactory.getItem(itemNumber);

                let itemArrPosI = scope.itemArrPosI = itemController.itemArrPosI = itemData.arrPosition.i;
                let itemArrPosJ = scope.itemArrPosJ = itemController.itemArrPosJ = itemData.arrPosition.j;

                let isLocked = itemData.data.isLocked;
                let imgSrc = itemData.data.img;

                const imageWrapper = angular.element(element[0].querySelector('#imageWrapper'));
                imageWrapper[0].id = 'borderImg' + itemNumber;

                const imgg = angular.element(element[0].querySelector('#img'));
                imgg[0].id = 'img' + itemNumber;

                let t2BorderImageSize = itemData.data.css.t2BorderImageSize;
                let t2BackgroundBorderRadius = itemData.data.css.t2BackgroundBorderRadius;
                let t2BackgroundWidth = itemData.data.css.t2BackgroundWidth;
                let t2BackgroundHeight = itemData.data.css.t2BackgroundHeight;
                let t2BackgroundColor = itemData.data.css.t2BackgroundColor;
                let t2FrontImageSize = itemData.data.css.t2FrontImageSize;
                let t2FrontImagePosX = itemData.data.css.t2FrontImagePosX;
                let t2FrontImagePosY = itemData.data.css.t2FrontImagePosY;
                let t2FontSize = itemData.data.css.t2FontSize;
                let t2BorderWidth = itemData.data.css.t2BorderWidth;
                let t2BorderColor = itemData.data.css.t2BorderColor;
                let t2BorderImg = itemData.data.borderImg;
                let t2FrontImg = itemData.data.frontImg;

                const borderImg = angular.element(element[0].querySelector('#borderImg' + itemNumber));
                const boxContainer = angular.element(element[0].querySelector('.boxContainer'));
                let img = angular.element(element[0].querySelector('#img' + itemNumber));
                const text = angular.element(element[0].querySelector('#text'));
                const elementParent = element.parent();

                img[0].src = t2FrontImg;

                elementParent.css({ borderWidth: (typeof t2BorderWidth === 'string' ? t2BorderWidth : t2BorderWidth + 'px') })
                elementParent.css({ borderColor: t2BorderColor })
                borderImg.css({ backgroundSize: (typeof t2BorderImageSize === 'string' ? t2BorderImageSize : t2BorderImageSize + '%') })
                borderImg.css({ backgroundImage: 'url(' + t2BorderImg + ')' });
                boxContainer.css({ borderRadius: (typeof t2BackgroundBorderRadius === 'string' ? t2BackgroundBorderRadius : t2BackgroundBorderRadius + '%') })
                boxContainer.css({ width: (typeof t2BackgroundWidth === 'string' ? t2BackgroundWidth : t2BackgroundWidth + '%') })
                boxContainer.css({ height: (typeof t2BackgroundHeight === 'string' ? t2BackgroundHeight : t2BackgroundHeight + '%') })
                boxContainer.css({ backgroundColor: (typeof t2BackgroundColor === 'string' ? t2BackgroundColor : t2BackgroundColor) })
                img.css({ width: (typeof t2FrontImageSize === 'string' ? t2FrontImageSize : t2FrontImageSize + '%') })
                img.css({ left: (typeof t2FrontImagePosX === 'string' ? t2FrontImagePosX : t2FrontImagePosX + '%') })
                img.css({ bottom: (typeof t2FrontImagePosY === 'string' ? t2FrontImagePosY : t2FrontImagePosY + '%') })
                text.css({ fontSize: (typeof t2FontSize === 'string' ? t2FontSize : t2FontSize + 'px') })

                function t2FrontImage(blob) {
                    img[0].src = blob;
                }
                function t2FrontImageSliderCss(val) {
                    console.log(val)
                }
                function t2BorderImageSizeCss(value) {
                    console.log('t2BorderImageSizeCss')
                    borderImg.css({ backgroundSize: value + '%' })
                    ItemDataFactory.saveItemCss(value, itemArrPosI, itemArrPosJ, 't2BorderImageSize');
                }
                function t2BackgroundBorderRadiusCss(value) {
                    console.log('t2BackgroundBorderRadiusCss')
                    boxContainer.css({ borderRadius: value + '%' })
                    ItemDataFactory.saveItemCss(value, itemArrPosI, itemArrPosJ, 't2BackgroundBorderRadius');
                }
                function t2BackgroundWidthCss(value) {
                    console.log('t2BackgroundWidthCss')
                    boxContainer.css({ width: value + '%' })
                    ItemDataFactory.saveItemCss(value, itemArrPosI, itemArrPosJ, 't2BackgroundWidth');
                }
                function t2BackgroundHeightCss(value) {
                    console.log('t2BackgroundHeightCss')
                    boxContainer.css({ height: value + '%' })
                    ItemDataFactory.saveItemCss(value, itemArrPosI, itemArrPosJ, 't2BackgroundHeight');
                }
                function t2BackgroundColorCss(value) {
                    console.log('t2BackgroundColorCss')
                    boxContainer.css({ backgroundColor: value })
                    ItemDataFactory.saveItemCss(value, itemArrPosI, itemArrPosJ, 't2BackgroundColor');
                }
                function t2FrontImageSizeCss(value) {
                    console.log('t2FrontImageSizeCss')
                    img = angular.element(element[0].querySelector('#img' + itemNumber));
                    img.css({ width: value + '%' })
                    ItemDataFactory.saveItemCss(value, itemArrPosI, itemArrPosJ, 't2FrontImageSize');
                }
                function t2FrontImagePosXCss(value) {
                    console.log('t2FrontImagePosXCss')
                    img = angular.element(element[0].querySelector('#img' + itemNumber));
                    img.css({ left: value + '%' })
                    ItemDataFactory.saveItemCss(value, itemArrPosI, itemArrPosJ, 't2FrontImagePosX');
                }
                function t2FrontImagePosYCss(value) {
                    console.log('t2FrontImagePosYCss')
                    img = angular.element(element[0].querySelector('#img' + itemNumber));
                    img.css({ bottom: value + '%' })
                    ItemDataFactory.saveItemCss(value, itemArrPosI, itemArrPosJ, 't2FrontImagePosY');
                }
                function t2BorderWidthCss(value) {
                    console.log('t2BorderWidthCss')
                    elementParent.css({ borderWidth: value + 'px' })
                    ItemDataFactory.saveItemCss(value, itemArrPosI, itemArrPosJ, 't2BorderWidth');
                }
                function t2BorderColorCss(value) {
                    console.log('chageBorderColorCss')
                    elementParent.css({ borderColor: value })
                    ItemDataFactory.saveItemCss(value, itemArrPosI, itemArrPosJ, 't2BorderColor');
                }
                function t2FontSizeCss(value) {
                    console.log('chageFontSizeCss')
                    text.css({ fontSize: value + 'px' })
                    ItemDataFactory.saveItemCss(value, itemArrPosI, itemArrPosJ, 't2FontSize');
                }
                function t2TextPosXCss(value) {
                    console.log('t2TextPosXCss')
                    text.css({ left: value + 'px' })
                    ItemDataFactory.saveItemCss(value, itemArrPosI, itemArrPosJ, 't2TextPosX');
                }
                function t2TextPosYCss(value) {
                    console.log('t2TextPosYCss')
                    text.css({ bottom: value + 'px' })
                    ItemDataFactory.saveItemCss(value, itemArrPosI, itemArrPosJ, 't2TextPosY');
                }
                function t2Name(value) {
                    console.log('chageImage')
                    ItemDataFactory.saveItem(value, itemArrPosI, itemArrPosJ, 'name');
                }
                function t2Image(val) {
                    console.log('chageImage ', val)
                }

                // Recive broadcast from generalToolbar-----------------------------------------------------
                scope.$on('t2TextChanged', function (e, val) {
                    console.log(val)
                    scope.text = val;
                });
                // -----------------------------------------------------------------------------------------

                scope.$on('$destroy', function () {
                    console.log('template2 ' + itemNumber + ' scope destroyed');
                    angular.element(document.querySelector('#template2ToolBox' + itemNumber)).remove();
                })
                element.on('$destroy', function () {
                    console.log('template2 ' + itemNumber + ' element destroyed');
                })

            }
        }
    }]);

    app.directive('template2ToolBox', ['ImageReaderFactory', 'ItemDataFactory', '$compile', function (ImageReaderFactory, ItemDataFactory, $compile) {
        return {
            restrict: 'EA',
            transclude: false,
            replace: false,
            scope: false,
            controller: 'MyController',
            require: ['^^?template2', '^?item'],
            templateUrl: 'template2/template2ToolBox.html',
            link: function (scope, element, attrs, controllers) {

                let template2Controller = controllers[0];
                let itemController = controllers[1];
                let itemNumber = null;
                let generalTools = false;
                let itemArrPosI = null;
                let itemArrPosJ = null;

                if (itemController) {
                    generalTools = false; // directive called from item
                    itemNumber = itemController.itemNumber;
                    scope.itemId = itemNumber;
                    itemArrPosI = itemController.itemArrPosI;
                    itemArrPosJ = itemController.itemArrPosJ;

                    // element.addClass('hideBlock');
                    element.attr('id', 'template2ToolBox' + itemNumber);

                    // const elementToolsElement = angular.element(document.querySelector('#itemToolBoxIncludeWrapper'));
                    // elementToolsElement.append(element);

                    const itemToolboxCard = angular.element(document.querySelector('#itemToolboxCard' + itemController.itemNumber));
                    itemToolboxCard.append(element);
                }
                else {
                    generalTools = true; // directive called from general Toolbar
                }

                // Fill template2 scope inputs-----------------------------------------------------
                if (generalTools) {
                    // Fill template2 general Toolbox scope inputs
                    scope.itemData = {};
                    scope.itemData.t2BorderWidth = parseInt(getComputedStyle(document.documentElement).getPropertyValue("--t2BorderWidth"));
                    scope.itemData.t2BorderColor = getComputedStyle(document.documentElement).getPropertyValue("--t2BorderColor");
                    scope.itemData.t2BorderImageSize = parseInt(getComputedStyle(document.documentElement).getPropertyValue("--t2BorderImageSize"));
                    scope.itemData.t2BackgroundBorderRadius = parseInt(getComputedStyle(document.documentElement).getPropertyValue("--t2BackgroundBorderRadius"));
                    scope.itemData.t2BackgroundWidth = parseInt(getComputedStyle(document.documentElement).getPropertyValue("--t2BackgroundWidth"));
                    scope.itemData.t2BackgroundHeight = parseInt(getComputedStyle(document.documentElement).getPropertyValue("--t2BackgroundHeight"));
                    scope.itemData.t2BackgroundColor = getComputedStyle(document.documentElement).getPropertyValue("--t2BackgroundColor");
                    scope.itemData.t2FrontImageSize = parseInt(getComputedStyle(document.documentElement).getPropertyValue("--t2FrontImageSize"));
                    scope.itemData.t2FrontImagePosX = parseInt(getComputedStyle(document.documentElement).getPropertyValue("--t2FrontImagePosX"));
                    scope.itemData.t2FrontImagePosY = parseInt(getComputedStyle(document.documentElement).getPropertyValue("--t2FrontImagePosY"));
                    scope.itemData.t2FontSize = parseInt(getComputedStyle(document.documentElement).getPropertyValue("--t2FontSize"));
                    scope.itemData.t2TextPosX = parseInt(getComputedStyle(document.documentElement).getPropertyValue("--t2TextPosX"));
                    scope.itemData.t2TextPosY = parseInt(getComputedStyle(document.documentElement).getPropertyValue("--t2TextPosY"));
                }
                else {
                    // Fill template2 item Toolbox scope inputs
                    let itemData = ItemDataFactory.getItem(itemNumber);
                    let t2BorderImageSize = itemData.data.css.t2BorderImageSize;
                    let t2BackgroundBorderRadius = itemData.data.css.t2BackgroundBorderRadius;
                    let t2BackgroundWidth = itemData.data.css.t2BackgroundWidth;
                    let t2BackgroundHeight = itemData.data.css.t2BackgroundHeight;
                    let t2BackgroundColor = itemData.data.css.t2BackgroundColor;
                    let t2FrontImageSize = itemData.data.css.t2FrontImageSize;
                    let t2FrontImagePosX = itemData.data.css.t2FrontImagePosX;
                    let t2FrontImagePosY = itemData.data.css.t2FrontImagePosY;
                    let t2FontSize = itemData.data.css.t2FontSize;
                    let t2BorderWidth = itemData.data.css.t2BorderWidth;
                    let t2BorderColor = itemData.data.css.t2BorderColor;
                    let t2TextPosX = itemData.data.css.t2TextPosX;
                    let t2TextPosY = itemData.data.css.t2TextPosY;
                    let elementName = itemData.data.name;
                    scope.isLocked = itemData.data.isLocked;
                    scope.itemData.t2BorderImageSize = typeof t2BorderImageSize === 'string' ? 20 : t2BorderImageSize;
                    scope.itemData.t2BackgroundBorderRadius = typeof t2BackgroundBorderRadius === 'string' ? 5 : t2BackgroundBorderRadius;
                    scope.itemData.t2BackgroundWidth = typeof t2BackgroundWidth === 'string' ? 80 : t2BackgroundWidth;
                    scope.itemData.t2BackgroundHeight = typeof t2BackgroundHeight === 'string' ? 80 : t2BackgroundHeight;
                    scope.itemData.t2BackgroundColor = (t2BackgroundColor == 'var(--t2BackgroundColor)' ? '#483d8b' : t2BackgroundColor);
                    scope.itemData.t2FrontImageSize = typeof t2FrontImageSize === 'string' ? 70 : t2FrontImageSize;
                    scope.itemData.t2FrontImagePosX = typeof t2FrontImagePosX === 'string' ? 0 : t2FrontImagePosX;
                    scope.itemData.t2FrontImagePosY = typeof t2FrontImagePosY === 'string' ? 30 : t2FrontImagePosY;
                    scope.itemData.t2FontSize = typeof t2FontSize === 'string' ? 60 : t2FontSize;
                    scope.itemData.t2BorderWidth = typeof t2BorderWidth === 'string' ? 2 : t2BorderWidth;
                    scope.itemData.t2BorderColor = (t2BorderColor === 'var(--t2BorderColor)' ? '#ff1493' : t2BorderColor);
                    scope.itemData.t2TextPosX = (typeof t2TextPosX === 'string' ? 0 : t2TextPosX);
                    scope.itemData.t2TextPosY = (typeof t2TextPosY === 'string' ? -95 : t2TextPosY);
                    scope.itemData.t2Text = elementName;
                    scope.text = elementName;
                }
                // -----------------------------------------------------------------------------------------

                scope.changeCSS = function (who, val) {
                    console.log(who + ' ' + val);
                    let suffix = '%';
                    if (!generalTools) {
                        scope.isLocked = true;
                        ItemDataFactory.saveItem(true, itemArrPosI, itemArrPosJ, 'isLocked');
                        if (who === 't2Text') {
                            scope.text = val;
                            ItemDataFactory.saveItem(val, itemArrPosI, itemArrPosJ, 'name');
                        } else {
                            let temp = who + 'Css';
                            itemController[temp](val);
                        }
                    }
                    else {
                        if (who === 't2Text') {
                            ItemDataFactory.saveTextAll('template2', val);
                            scope.$broadcast('t2TextChanged', val);
                        } else {
                            switch (who) {
                                case 't2BackgroundColor':
                                case 't2BorderColor':
                                    suffix = '';
                                    break;
                                case 't2BorderWidth':
                                case 't2FontSize':
                                case 't2TextPosX':
                                case 't2TextPosY':
                                    suffix = 'px';
                                    break;
                                default:
                                    break;
                            }
                            document.documentElement.style.setProperty(`--${who}`, val + suffix);
                        }
                    }
                }

                // scope.t2BorderImageSize = function(val){
                //     if (!generalTools) {
                //         console.log(generalTools)
                //         let itemArrPosI = itemController.itemArrPosI; let itemArrPosJ = itemController.itemArrPosJ;
                //         scope.isLocked = true;
                //         ItemDataFactory.saveItem(true, itemArrPosI, itemArrPosJ, 'isLocked');
                //         itemController.t2BorderImageSizeCss(val);
                //     }else{
                //         document.documentElement.style.setProperty('--t2BorderImageSize', val + '%');
                //     }
                // }
                // scope.t2BackgroundBorderRadius = function(val){
                //     if (!generalTools) {
                //         let itemArrPosI = itemController.itemArrPosI; let itemArrPosJ = itemController.itemArrPosJ;
                //         scope.isLocked = true;
                //         ItemDataFactory.saveItem(true, itemArrPosI, itemArrPosJ, 'isLocked');
                //         itemController.t2BackgroundBorderRadiusCss(val);
                //     }
                //     else{
                //         scope.t2BackgroundBorderRadiusCss(val);
                //     }
                // }
                // scope.t2BackgroundWidth = function(val){
                //     if (!generalTools) {
                //         let itemArrPosI = itemController.itemArrPosI; let itemArrPosJ = itemController.itemArrPosJ;
                //         scope.isLocked = true;
                //         ItemDataFactory.saveItem(true, itemArrPosI, itemArrPosJ, 'isLocked');
                //         itemController.t2BackgroundWidthCss(val);
                //     }
                //     else{
                //         scope.t2BackgroundWidthCss(val);
                //     }
                // }
                // scope.t2BackgroundHeight = function(val){
                //     let itemArrPosI = itemController.itemArrPosI; let itemArrPosJ = itemController.itemArrPosJ;
                //     if (!generalTools) {
                //         scope.isLocked = true;
                //         ItemDataFactory.saveItem(true, itemArrPosI, itemArrPosJ, 'isLocked');
                //         itemController.t2BackgroundHeightCss(val);
                //     }
                //     else{
                //         scope.t2BackgroundHeightCss(val);
                //     }
                // }
                // scope.t2BackgroundColor = function(val){
                //     if (!generalTools) {
                //         let itemArrPosI = itemController.itemArrPosI; let itemArrPosJ = itemController.itemArrPosJ;
                //         scope.isLocked = true;
                //         ItemDataFactory.saveItem(true, itemArrPosI, itemArrPosJ, 'isLocked');
                //         itemController.t2BackgroundColorCss(val);
                //     }
                //     else{
                //         scope.t2BackgroundColorCss(val);
                //     }
                // }
                // scope.t2FrontImageSize = function(val){
                //     if (!generalTools) {
                //         let itemArrPosI = itemController.itemArrPosI; let itemArrPosJ = itemController.itemArrPosJ;
                //         scope.isLocked = true;
                //         ItemDataFactory.saveItem(true, itemArrPosI, itemArrPosJ, 'isLocked');
                //         itemController.t2FrontImageSizeCss(val);
                //     }
                //     else{
                //         scope.t2FrontImageSizeCss(val);
                //     }
                // }
                // scope.t2FrontImagePosX = function(val){
                //     if (!generalTools){
                //         let itemArrPosI = itemController.itemArrPosI; let itemArrPosJ = itemController.itemArrPosJ;
                //         scope.isLocked = true;
                //         ItemDataFactory.saveItem(true, itemArrPosI, itemArrPosJ, 'isLocked');
                //         itemController.t2FrontImagePosXCss(val);
                //     }
                //     else{
                //         scope.t2FrontImagePosXCss(val);
                //     }
                // }
                // scope.t2FrontImagePosY = function(val){
                //     if (!generalTools){
                //         let itemArrPosI = itemController.itemArrPosI; let itemArrPosJ = itemController.itemArrPosJ;
                //         scope.isLocked = true;
                //         ItemDataFactory.saveItem(true, itemArrPosI, itemArrPosJ, 'isLocked');
                //         itemController.t2FrontImagePosYCss(val);
                //     }
                //     else{
                //         scope.t2FrontImagePosYCss(val);
                //     }
                // }
                // scope.t2FontSize = function(val){
                //     if (!generalTools){
                //         let itemArrPosI = itemController.itemArrPosI; let itemArrPosJ = itemController.itemArrPosJ;
                //         scope.isLocked = true;
                //         ItemDataFactory.saveItem(true, itemArrPosI, itemArrPosJ, 'isLocked');
                //         itemController.t2FontSizeCss(val);
                //     }
                //     else{
                //         scope.t2FontSizeCss(val);
                //     }
                // }
                // scope.t2BorderWidth = function(val){
                //     if (!generalTools) {
                //         let itemArrPosI = itemController.itemArrPosI; let itemArrPosJ = itemController.itemArrPosJ;
                //         scope.isLocked = true;
                //         ItemDataFactory.saveItem(true, itemArrPosI, itemArrPosJ, 'isLocked');
                //         itemController.t2BorderWidthCss(val);
                //     }else{
                //         // scope.t2BorderWidthCss(val);
                //         document.documentElement.style.setProperty('--border-width', val + 'px');
                //     }
                // }
                // scope.t2BorderColor = function(val){

                //     if (!generalTools) {
                //         let itemArrPosI = itemController.itemArrPosI; let itemArrPosJ = itemController.itemArrPosJ;
                //         scope.isLocked = true;
                //         ItemDataFactory.saveItem(true, itemArrPosI, itemArrPosJ, 'isLocked');
                //         itemController.t2BorderColorCss(val);
                //     } else {
                //         // scope.t2BorderColorCss(val);
                //         document.documentElement.style.setProperty('--border-color', val);
                //     }
                // }

                let input = angular.element(element[0].querySelector('#t2borderImageInput'));
                input.on('change', function (event) {
                    scope.isLocked = true;
                    ItemDataFactory.saveItem(true, itemArrPosI, itemArrPosJ, 'isLocked');

                    ImageReaderFactory.readFile(event, true).then(function (data) {
                        ItemDataFactory.saveItem(data.blob, itemArrPosI, itemArrPosJ, 'borderImg');
                        ItemDataFactory.saveItem(true, itemArrPosI, itemArrPosJ, 'imgIsLocked');
                        angular.element(document.querySelector("#borderImg" + itemNumber)).css({ backgroundImage: 'url(' + data.blob + ')' });
                    })
                });

                let input2 = angular.element(element[0].querySelector('#t2frontImageInput'));
                input2.on('change', function (event) {
                    scope.isLocked = true;
                    ItemDataFactory.saveItem(true, itemArrPosI, itemArrPosJ, 'isLocked');

                    ImageReaderFactory.readFile(event, true).then(function (data) {
                        ItemDataFactory.saveItem(data.blob, itemArrPosI, itemArrPosJ, 'frontImg');
                        ItemDataFactory.saveItem(true, itemArrPosI, itemArrPosJ, 'imgIsLocked');
                        itemController.t2FrontImage(data.blob);

                        // ImageReaderFactory.createCanvas(data.blob, itemNumber).then(function(canvas) {
                        //     itemController.t2FrontImage(canvas)
                        // })
                    })
                });

                scope.close = function () {
                    angular.element(document.querySelectorAll('.selected')).removeClass('selected');
                    angular.element(document.querySelector('#tools')).removeClass('hideBlock');
                    angular.element(document.querySelector('#itemToolBoxIncludeWrapper')).addClass('hideBlock');
                }

                element.scope().$on('$destroy', function () {
                    console.log('template2ToolBox ' + itemNumber + ' scope destroyed');
                })
                element.on('$destroy', function () {
                    console.log('template2ToolBox ' + itemNumber + ' element destroyed');
                })
            }
        }
    }]);

    app.factory('ItemDataFactory', [function () {
        // var itemsArr = [
        //     [
        //         { 
        //             id: 1, isCustom: true, template: '<my-image><my-text></my-text></my-image>', name: "test1", isLocked: false,
        //             img: "images/127458.jpg", borderImg: "images/127458.jpg", imgIsLocked: false, 
        //             css: { 
        //                 elementObjectFitSelect: 'var(--object-fit)', elementDivitionSize: 'var(--image-wrapper-size)', 
        //                 elementFontSize: "var(--font-size)", elementBorderWidth: 'var(--border-width)', elementBorderColor: 'var(--border-color)' 
        //             } 
        //         },

        //         { 
        //             id: 2, isTest: false, isCustom: true, template: '<my-image><my-text></my-text></my-image>', name: "test2", isLocked: false, 
        //             img: "images/127458.jpg", borderImg: "images/127458.jpg", imgIsLocked: false, 
        //             css: { 
        //                 elementObjectFitSelect: 'var(--object-fit)', elementDivitionSize: 'var(--image-wrapper-size)', 
        //                 elementFontSize: "var(--font-size)", elementBorderWidth: 'var(--border-width)', elementBorderColor: 'var(--border-color)' 
        //             } 
        //         },

        //         {
        //             id: 3, isCustom: true, template: 'template2', name: "test3", isLocked: false, borderImg: "images/YellowFlower_39.png",
        //             frontImg: "images/valentine-bee-freebie3_WhimsyClips.png", imgIsLocked: false,
        //             css: {
        //                 t2BorderImageSize: 'var(--t2BorderImageSize)',
        //                 t2BackgroundColor: 'var(--t2BackgroundColor)',
        //                 t2BackgroundBorderRadius: 'var(--t2BackgroundBorderRadius)',
        //                 t2BackgroundWidth: 'var(--t2BackgroundWidth)',
        //                 t2BackgroundHeight: 'var(--t2BackgroundHeight)',
        //                 t2FrontImageSize: 'var(--t2FrontImageSize)',
        //                 t2FrontImagePosX: 'var(--t2FrontImagePosX)',
        //                 t2FrontImagePosY: 'var(--t2FrontImagePosY)',
        //                 t2FontSize: "var(--t2FontSize)",
        //                 t2BorderWidth: 'var(--t2BorderWidth)',
        //                 t2BorderColor: 'var(--t2BorderColor)',
        //                 t2TextPosX: 'var(--t2TextPosX)',
        //                 t2TextPosY: 'var(--t2TextPosY)'
        //             } 
        //         },

        //         { 
        //             id: 4, isCustom: true, template: 'template1', name: "test4", isLocked: false, img: "images/127458.jpg", 
        //             borderImg: "images/127458.jpg", imgIsLocked: false, 
        //             css: { 
        //                 elementObjectFitSelect: 'var(--object-fit)', elementDivitionSize: 'var(--image-wrapper-size)', 
        //                 elementFontSize: "var(--font-size)", elementBorderWidth: 'var(--border-width)', elementBorderColor: 'var(--border-color)' 
        //             } 
        //         }

        //     ]
        // ];

        let itemsArr = [
            [
                {
                    id: 1, isCustom: true, isLocked: false, customElements: {}
                },

                {
                    id: 2, isCustom: true, isLocked: false, customElements: {}
                },

                {
                    id: 3, isCustom: true, isLocked: false, customElements: {}
                },

                {
                    id: 4, isCustom: true, isLocked: false, customElements: {}
                },

            ]
        ];
        return {
            resetItemsArr: function () {
                itemsArr = [
                    [
                        { id: 1, isCustom: true, isLocked: false, customElements: {} },
                        { id: 2, isCustom: true, isLocked: false, customElements: {} },
                        { id: 3, isCustom: true, isLocked: false, customElements: {} },
                        { id: 4, isCustom: true, isLocked: false, customElements: {} },

                    ]
                ];
            },
            addCustomElementToItemsArr: function (tag, id, customElement) {
                for (let i = 0; i < itemsArr.length; i++) {
                    for (let j = 0; j < itemsArr[i].length; j++) {
                        if (itemsArr[i][j].id === id) {
                            if (tag === 'text') {
                                // console.log(itemsArr[i][j].customElements[customElement]);
                                if (!itemsArr[i][j].customElements[customElement]) {
                                    itemsArr[i][j].customElements[customElement] = {
                                        style: {
                                            fontSize: '70px',
                                            color: '#db7093',
                                            transform: 'rotate(0deg)',
                                            left: '0%',
                                            bottom: '0%'
                                        },
                                        gridItemStyle: {
                                            border: '1px solid rgb(255, 120, 120)',
                                            borderWidth: '3px',
                                            borderColor: '#db7093',
                                            backgroundColor: 'transparent',
                                            backgroundClip: 'padding-box',
                                            margin: '-1px'
                                        },
                                        text: "my text"
                                    }
                                }
                            }
                            else if (tag === 'image') {
                                if (!itemsArr[i][j].customElements[customElement]) {
                                    itemsArr[i][j].customElements[customElement] = {
                                        style: {
                                            transform: 'rotate(0deg)',
                                            // filter: 'blur(0px) brightness(100%) contrast(100%) sepia(0%) hue-rotate(0deg)',
                                            // mixBlendMode: 'multiply',
                                            mixBlendMode: 'none',
                                            width: '100%',
                                            left: '0%',
                                            // bottom: '0%',
                                            bottom: 'unset',
                                            // backfaceVisibility: 'hidden'
                                        },
                                        gridItemStyle: {
                                            border: '1px solid rgb(255, 120, 120)',
                                            borderWidth: '3px',
                                            borderColor: '#db7093',
                                            backgroundColor: 'transparent',
                                            backgroundClip: 'padding-box',
                                            margin: '-1px'
                                        },
                                        imgSrc: "images/img_placeholder3.svg"
                                    }
                                }
                            }
                        }
                    }
                }
                // console.log(itemsArr)
            },
            saveData: function (arr) {
                console.log('saveData ')

                for (let i = 0; i < itemsArr.length; i++) {
                    for (let j = 0; j < itemsArr[i].length; j++) {

                        // console.log(itemsArr[i][j].id)

                        for (let k = 0; k < arr.length; k++) {
                            for (let l = 0; l < arr[k].length; l++) {
                                if (arr[k][l].id === itemsArr[i][j].id) {
                                    arr[k][l] = itemsArr[i][j];
                                    break
                                }
                            }
                        }

                    }
                }

                itemsArr = arr;
                console.log(itemsArr)

            },
            getData: function () {
                return itemsArr;
            },
            saveItem: function (val, i, j, path) {
                itemsArr[i][j][path] = val;
                console.log(itemsArr)
            },
            saveItemCss: function (val, i, j, path) {
                console.log('saveItemCss()' + ' ' + path + ' ' + val)
                if (val !== null) itemsArr[i][j].css[path] = val;
                console.log(itemsArr)
            },
            saveItemStyle: function (val, i, j, property, propertyValue, gridItem, isGrandpa) {
                console.log('saveItemStyle');
                if (i !== null && j !== null) {
                    if (val !== null && !isGrandpa) {
                        itemsArr[i][j].customElements[gridItem].style[property] = val;
                    }
                    else {
                        itemsArr[i][j].customElements[gridItem].gridItemStyle[property] = val;
                    }
                }
                else {
                    console.log('mierdaaaaaaaaa', i, j)
                    if (val !== null && !isGrandpa) {
                        // itemsArr[i][j].customElements[gridItem].style[property] = val;
                        for (let i = 0; i < itemsArr.length; i++) {
                            for (let j = 0; j < itemsArr[i].length; j++) {
                                itemsArr[i][j].customElements[gridItem].style[property] = val;
                            }
                        }
                    }
                    else {
                        // itemsArr[i][j].customElements[gridItem].gridItemStyle[property] = val;
                        for (let i = 0; i < itemsArr.length; i++) {
                            for (let j = 0; j < itemsArr[i].length; j++) {
                                itemsArr[i][j].customElements[gridItem].gridItemStyle[property] = val;
                            }
                        }
                    }

                }
                console.log(itemsArr);
            },
            saveItemText: function (val, i, j, property, propertyValue, gridItem, id) {
                console.log(val, i, j, property, propertyValue, gridItem, id)
                if (i && j && val !== null) {
                    itemsArr[i][j].customElements[gridItem].text = val;
                    console.log('saved')
                }
                else {
                    for (let i = 0; i < itemsArr.length; i++) {
                        for (let j = 0; j < itemsArr[i].length; j++) {
                            if (itemsArr[i][j].id === id) {
                                itemsArr[i][j].customElements[gridItem].text = val;
                                console.log(itemsArr)
                                return;
                            }
                        }
                    }
                }
            },
            saveItemImgSrc: function (val, i, j, property, propertyValue, gridItem, isGrandpa) {
                console.log(i, j, property, propertyValue, gridItem)
                if (val !== null && !isGrandpa) itemsArr[i][j].customElements[gridItem].imgSrc = val;
                console.log(itemsArr)
            },
            saveImgSrc: function (val, i, j, gridItem, id) {
                if (i && j) {
                    console.log(i, j, gridItem)
                    if (val !== null) itemsArr[i][j].customElements[gridItem].imgSrc = val;
                    console.log(itemsArr)
                }
                else {
                    for (let i = 0; i < itemsArr.length; i++) {
                        for (let j = 0; j < itemsArr[i].length; j++) {
                            // console.log(     itemsArr[i][j].customElements[gridItem].imgSrc     )
                            if (itemsArr[i][j].id === id) {
                                itemsArr[i][j].customElements[gridItem].imgSrc = val;
                                return;
                            }
                        }
                    }
                    console.log(itemsArr)
                }
            },
            getItem: function (id) {
                for (let i = 0; i < itemsArr.length; i++) {
                    for (let j = 0; j < itemsArr[i].length; j++) {
                        if (itemsArr[i][j].id == id) {
                            return { data: itemsArr[i][j], arrPosition: { i: i, j: j } };
                        }
                    }
                }
            },
            saveCss: function (id, data) {
                for (let i = 0; i < itemsArr.length; i++) {
                    for (let j = 0; j < itemsArr[i].length; j++) {
                        if (itemsArr[i][j].id == id) {
                            itemsArr[i][j].css = data;
                        }
                    }
                }
            },
            saveTextAll: function (template, val) {
                for (let i = 0; i < itemsArr.length; i++) {
                    for (let j = 0; j < itemsArr[i].length; j++) {
                        if (itemsArr[i][j].template === template) {
                            itemsArr[i][j].name = val;
                        }
                    }

                }
            }
        }
    }]);

    app.factory('MouseDownService', [function () {
        let mousedown = false;
        return {
            up: function () {
                mousedown = false;
            },
            down: function () {
                mousedown = true;
            },
            status: function () {
                return mousedown;
            }
        }
    }]);

    app.factory('CurrentStateService', [function () {
        let pageHasChanges = true;
        let itemStatus = { 1: true };
        return {
            setPageHasChanges: function (itemQuantity) {
                for (let i = 1; i <= itemQuantity; i++) {
                    itemStatus[i] = true;
                }
            },
            getPageHasChanges: function (itemNumber) {
                return itemStatus[itemNumber];
            }
        }
    }]);

    app.factory('NotificationsFactory', ['$rootScope', function ($rootScope) {
        return {
            show: function (message) {
                let notificationWrapper = angular.element(document.querySelector('.notification-wrapper'));
                $rootScope.$broadcast('notification', message);
            }
        }
    }]);

    app.factory('EditModeService', [function () {
        let editMode = false;
        let element = {};
        let itemsGridArr = [
            { val: 1, isDummy: true, w: 1, h: 1, position: { start: { row: 0, col: 0 }, end: { row: 0, col: 0 } } },
            { val: 2, isDummy: true, w: 1, h: 1, position: { start: { row: 0, col: 1 }, end: { row: 0, col: 1 } } },
            { val: 3, isDummy: true, w: 1, h: 1, position: { start: { row: 1, col: 0 }, end: { row: 1, col: 0 } } },
            { val: 4, isDummy: true, w: 1, h: 1, position: { start: { row: 1, col: 1 }, end: { row: 1, col: 1 } } }
        ];
        let area = [
            ["a1", "a2"],
            ["a3", "a4"]
        ];
        let areaString = "'a1 a2' 'a3 a4'";
        let selectedItems = [];
        let gridCols = 2;
        let gridRows = 2;
        let resizingStatus = false;
        return {
            on: function () {
                editMode = true;
            },
            off: function () {
                editMode = false;
            },
            status: function () {
                return editMode;
            },
            save: function (el) {
                element = el;
                console.log(element[0]);
                console.log(element[0].innerHTML);

                download("custom_template_test0.html", element[0].innerHTML);

                function download(filename, text) {
                    var element = document.createElement('a');
                    element.setAttribute('href', 'data:text/plain;charset=utf-8,' + encodeURIComponent(text));
                    element.setAttribute('download', filename);

                    element.style.display = 'none';
                    document.body.appendChild(element);

                    element.click();

                    document.body.removeChild(element);
                }


            },
            isResizing: function (state) {
                if (typeof state !== 'undefined') resizingStatus = state;
                return resizingStatus;
            },
            getItemsGridArr: function () {
                return itemsGridArr;
            },
            setItemsGridArr: function (arr) {
                itemsGridArr = arr;
            },
            getAreaArr: function () {
                return area;
            },
            setAreaArr: function (arr) {
                area = arr;
            },
            getAreaString: function () {
                return areaString;
            },
            setAreaString: function (string) {
                areaString = string;
            },
            setSelectedItems: function (arr) {
                selectedItems = arr;
            },
            getSelectedItems: function () {
                return selectedItems;
            },
            setGridCols: function (val) {
                gridCols = val;
            },
            setGridRows: function (val) {
                gridRows = val;
            },
            getGridCols: function () {
                return gridCols;
            },
            getGridRows: function () {
                return gridRows;
            },
        }
    }]);

    app.factory('ImageReaderFactory', ['$q', function ($q) {
        return {
            readFile: function (event, input) {
                console.log('reading file')

                let defer = $q.defer();
                let file, name, reader, size, type;
                file = input ? event.target.files : event.dataTransfer.files;
                // reader = new FileReader();

                if (file.length === 1) {
                    reader = new FileReader();
                    reader.file = file[0];

                    reader.onload = function (evt) {
                        let fname = this.file.name;
                        let fsize = Math.round(this.file.size / 1024) + ' KB';
                        let fileRed = { blob: evt.target.result, name: fname, size: fsize };
                        defer.resolve(fileRed);
                    }

                    name = file[0].name;
                    type = file[0].type;
                    size = file[0].size;
                    reader.readAsDataURL(file[0]);

                    return defer.promise;
                }
                else {

                    let promises = [];
                    // let fileRedArr = [];

                    for (var i = 0; i < file.length; i++) {
                        var imageFile = file[i];
                        var promise = readImageAsPromise(imageFile, i);
                        promises.push(promise);
                    }

                    $q.all(promises).then(function () {
                        console.log("IMAGES RED SUCCESSFULY!!!!");
                        defer.resolve(promises);
                    });

                    function readImageAsPromise(imageFile, index) {

                        return $q(function (resolve, reject) {
                            reader = new FileReader();
                            reader.file = imageFile;

                            reader.onload = function (evt) {
                                let fname = this.file.name;
                                let fsize = Math.round(this.file.size / 1024) + ' KB';
                                // fileRedArr.push({ blob: evt.target.result, name: fname, size: fsize });
                                resolve({ blob: evt.target.result, name: fname, size: fsize });
                            }

                            name = imageFile.name;
                            type = imageFile.type;
                            size = imageFile.size;
                            reader.readAsDataURL(file[i]);
                        })

                    }
                    return defer.promise;
                }
            },

            createCanvas: function (blob, itemNumber) {

                let defer = $q.defer();
                var canvas = document.createElement("canvas");
                var ctx = canvas.getContext('2d');
                var img = new Image();

                img.onload = function () {
                    canvas.width = img.width;
                    canvas.height = img.height;
                    // canvas.style = "width: 100%;height:-webkit-fill-available;object-fit: var(--object-fit);position: absolute;top: 0px;bottom: 0px;left: 0px;right: 0px;";
                    canvas.id = "img" + itemNumber;
                    var hRatio = canvas.width / img.width;
                    var vRatio = canvas.height / img.height;
                    var ratio = Math.max(hRatio, vRatio); // Math.max crop to fit canvas, Math.min no crop
                    var centerShift_x = (canvas.width - img.width * ratio) / 2;
                    var centerShift_y = (canvas.height - img.height * ratio) / 2;

                    // ctx.filter = 'blur(5px)';
                    ctx.drawImage(img, 0, 0, img.width, img.height);

                    // canvas to blob-------
                    // canvas.toBlob(function (blob) {
                    //     var newImg = document.createElement('img')
                    //     var url = URL.createObjectURL(blob);
                    //     defer.resolve(url);

                    //     newImg.onload = function () {
                    //         // no longer need to read the blob so it's revoked
                    //         // URL.revokeObjectURL(url);
                    //         // defer.resolve(url);
                    //     };

                    //     newImg.src = url;
                    // });
                    // ---------------------

                    defer.resolve(canvas);
                    // defer.resolve(angular.element(img)[0].src);
                }
                img.src = blob;
                return defer.promise;
            },
            drawCanvas: function (canvas, src, val, type) {

                let defer = $q.defer();

                let ctx = canvas.getContext('2d');
                let filter = ctx.filter;
                console.log(ctx.filter)
                let img = new Image();

                img.onload = function () {
                    // ctx.clearRect(0, 0, img.width, img.height);
                    switch (type) {
                        case 'blur':
                            ctx.filter = 'blur(' + val + 'px)';
                            break;
                        case 'sepia':
                            ctx.filter = 'sepia(' + val + '%)';
                            break;

                        default:
                            break;
                    }
                    ctx.drawImage(img, 0, 0, img.width, img.height);
                    defer.resolve(canvas);
                }
                img.src = src;
                return defer.promise;
            }
        }
    }]);

})();