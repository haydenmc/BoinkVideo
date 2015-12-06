var EventHandler = (function () {
    function EventHandler() {
        this.callbacks = new Array();
    }
    EventHandler.prototype.subscribe = function (callback) {
        this.callbacks.push(callback);
    };
    EventHandler.prototype.unSubscribe = function (callback) {
        var index = this.callbacks.indexOf(callback);
        if (index >= 0) {
            this.callbacks.splice(index, 1);
        }
    };
    EventHandler.prototype.unSubscribeAll = function () {
        this.callbacks = new Array();
    };
    EventHandler.prototype.fire = function (arg) {
        for (var i = 0; i < this.callbacks.length; i++) {
            this.callbacks[i](arg);
        }
    };
    return EventHandler;
})();
var Observable = (function () {
    function Observable(defaultValue) {
        this._onValueChanged = new EventHandler();
        this._value = defaultValue;
    }
    Object.defineProperty(Observable.prototype, "value", {
        get: function () {
            return this._value;
        },
        set: function (newVal) {
            if (this._value !== newVal) {
                var oldVal = this._value;
                this._value = newVal;
                this._onValueChanged.fire({ oldValue: oldVal, newValue: newVal });
            }
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Observable.prototype, "onValueChanged", {
        get: function () {
            return this._onValueChanged;
        },
        enumerable: true,
        configurable: true
    });
    return Observable;
})();
var DataBinding = (function () {
    function DataBinding(path, dataBinder) {
        var _this = this;
        this.dataBinder = dataBinder;
        this.path = path;
        this.childBindings = {};
        if (path.indexOf(".") >= 0) {
            this.property = path.substr(path.lastIndexOf(".") + 1);
        }
        else {
            this.property = path;
        }
        this.onValueChanged = new EventHandler();
        this.updateCallback = function (args) {
            _this.onValueChanged.fire({ path: _this.path, binding: _this, valueChangedEvent: args });
            _this.reattachChildren();
        };
        this.attachBinding();
    }
    Object.defineProperty(DataBinding.prototype, "value", {
        get: function () {
            return DataBinder.resolvePropertyPath(this.path, this.dataBinder.dataContext).value;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(DataBinding.prototype, "observableValue", {
        get: function () {
            return DataBinder.resolvePropertyPath(this.path, this.dataBinder.dataContext);
        },
        enumerable: true,
        configurable: true
    });
    DataBinding.prototype.reattachChildren = function (binding, detachFrom) {
        if (!binding) {
            binding = this;
        }
        for (var c in binding.childBindings) {
            if (binding.childBindings.hasOwnProperty(c)) {
                binding.childBindings[c].reattachBinding(detachFrom);
                this.reattachChildren(binding.childBindings[c], detachFrom);
            }
        }
    };
    DataBinding.prototype.reattachBinding = function (detachFrom) {
        this.detachBinding(detachFrom);
        this.attachBinding();
    };
    DataBinding.prototype.attachBinding = function () {
        var prop = DataBinder.resolvePropertyPath(this.path, this.dataBinder.dataContext);
        if (prop) {
            prop.onValueChanged.subscribe(this.updateCallback);
            this.onValueChanged.fire({ path: this.path, binding: this, valueChangedEvent: { oldValue: null, newValue: prop.value } });
        }
    };
    DataBinding.prototype.detachBinding = function (detachFrom) {
        var prop;
        if (detachFrom) {
            prop = DataBinder.resolvePropertyPath(this.path, detachFrom);
        }
        else {
            prop = DataBinder.resolvePropertyPath(this.path, this.dataBinder.dataContext);
        }
        if (prop) {
            prop.onValueChanged.unSubscribe(this.updateCallback);
        }
    };
    DataBinding.prototype.releaseListeners = function () {
        this.onValueChanged.unSubscribeAll();
    };
    return DataBinding;
})();
var DataBindingValueChangedEvent = (function () {
    function DataBindingValueChangedEvent() {
    }
    return DataBindingValueChangedEvent;
})();
var NodeBinding = (function () {
    function NodeBinding(node, bindings) {
        var _this = this;
        this.node = node;
        this.originalValue = this.node.nodeValue;
        this.bindings = bindings;
        this.updateCallback = function (args) {
            _this.updateNode();
        };
        for (var i = 0; i < this.bindings.length; i++) {
            this.bindings[i].onValueChanged.subscribe(this.updateCallback);
        }
        this.updateNode();
    }
    NodeBinding.prototype.updateNode = function () {
        var newValue = this.originalValue;
        for (var i = 0; i < this.bindings.length; i++) {
            newValue = newValue.replace("{{" + this.bindings[i].path + "}}", this.bindings[i].value);
        }
        this.node.nodeValue = newValue;
    };
    return NodeBinding;
})();
var DataBinder = (function () {
    function DataBinder(dataContext) {
        this._dataContext = dataContext;
        this.bindingTree = new DataBinding("", this);
        this.nodeBindings = [];
    }
    Object.defineProperty(DataBinder.prototype, "dataContext", {
        get: function () {
            return this._dataContext;
        },
        set: function (newContext) {
            if (this._dataContext !== newContext) {
                var oldContext = this._dataContext;
                this._dataContext = newContext;
                this.bindingTree.reattachBinding(oldContext);
                this.bindingTree.reattachChildren(null, oldContext);
            }
        },
        enumerable: true,
        configurable: true
    });
    DataBinder.parseBindings = function (str) {
        var bindingProperties = [];
        var bindingMatches = str.match(DataBinder.bindingRegex);
        if (bindingMatches != null && bindingMatches.length > 0) {
            for (var i = 0; i < bindingMatches.length; i++) {
                var path = bindingMatches[i].substr(2, bindingMatches[i].length - 4);
                bindingProperties.push(path);
            }
        }
        return bindingProperties;
    };
    DataBinder.prototype.bindNodes = function (node) {
        if (node instanceof Component) {
            return;
        }
        if (node.nodeType === 1 || node.nodeType === 11) {
            for (var i = 0; i < node.childNodes.length; i++) {
                this.bindNodes(node.childNodes[i]);
            }
        }
        else if (node.nodeType === 3) {
            var bindingMatches = DataBinder.parseBindings(node.nodeValue);
            var bindings = [];
            for (var i = 0; i < bindingMatches.length; i++) {
                bindings.push(this.registerBinding(bindingMatches[i]));
            }
            if (bindings.length > 0) {
                this.nodeBindings.push(new NodeBinding(node, bindings));
            }
        }
    };
    DataBinder.prototype.registerBinding = function (path) {
        if (path === "") {
            return this.bindingTree;
        }
        var properties = path.split(".");
        var parentBinding = this.bindingTree;
        var traversedPath = "";
        for (var i = 0; i < properties.length; i++) {
            if (i > 0) {
                traversedPath += ".";
            }
            traversedPath += properties[i];
            if (parentBinding.childBindings[properties[i]]) {
                parentBinding = parentBinding.childBindings[properties[i]];
            }
            else {
                var bindingInfo = new DataBinding(traversedPath, this);
                parentBinding.childBindings[properties[i]] = bindingInfo;
                parentBinding = bindingInfo;
            }
        }
        return parentBinding;
    };
    DataBinder.prototype.removeAllBindings = function (binding) {
        var currentBinding;
        if (binding) {
            currentBinding = binding;
        }
        else {
            currentBinding = this.bindingTree;
        }
        for (var childBinding in currentBinding.childBindings) {
            if (currentBinding.childBindings.hasOwnProperty(childBinding)) {
                this.removeAllBindings(currentBinding.childBindings[childBinding]);
                delete currentBinding.childBindings[childBinding];
            }
        }
        currentBinding.detachBinding();
        currentBinding.releaseListeners();
    };
    DataBinder.resolvePropertyPath = function (path, dataContext) {
        var currentDataContext = dataContext;
        if (path === "") {
            return currentDataContext;
        }
        var properties = path.split(".");
        for (var i = 0; i < properties.length; i++) {
            if (currentDataContext.value[properties[i]]) {
                currentDataContext = currentDataContext.value[properties[i]];
            }
            else {
                console.warn("Attempted to resolve non-existent property path: '" + path + "'.");
                return null;
            }
        }
        return currentDataContext;
    };
    DataBinder.bindingRegex = /{{[a-zA-Z._0-9]+}}/g;
    return DataBinder;
})();
var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
var Component = (function (_super) {
    __extends(Component, _super);
    function Component() {
        _super.call(this);
        this.createdCallback();
    }
    Object.defineProperty(Component.prototype, "dataContext", {
        get: function () {
            return this._dataContext;
        },
        set: function (newContext) {
            if (newContext !== this._dataContext) {
                var oldContext = this._dataContext;
                this._dataContext = newContext;
                if (typeof oldContext !== "undefined") {
                    this.dataContextUpdated(oldContext, newContext);
                }
            }
        },
        enumerable: true,
        configurable: true
    });
    Component.register = function (elementName, theClass) {
        document.registerElement(elementName, {
            prototype: theClass.prototype
        });
    };
    Component.prototype.createdCallback = function () {
        var _this = this;
        console.log("Component created: " + this.tagName);
        this.dataContextUpdatedCallback = function (arg) {
            _this.dataContext = arg.binding.observableValue;
        };
    };
    Component.prototype.attachedCallback = function () {
        console.log("Component attached.");
        if (typeof this.parentComponent === "undefined") {
            var parentElement = this.parentElement;
            while (!(parentElement instanceof Component)) {
                parentElement = parentElement.parentElement;
                if (parentElement == null) {
                    break;
                }
            }
            this.parentComponent = parentElement;
        }
        if (typeof this.dataContext === "undefined" && this.parentComponent) {
            this.dataContext = this.parentComponent.dataContext;
        }
        this.processDataContextAttributeBinding();
        this.dataBinder = new DataBinder(this.dataContext);
        this.applyShadowTemplate();
    };
    Component.prototype.dataContextUpdated = function (oldContext, newContext) {
        if (this.dataBinder) {
            this.dataBinder.dataContext = newContext;
        }
    };
    Component.prototype.processDataContextAttributeBinding = function () {
        var dataContextAttr = this.attributes.getNamedItem("data-context");
        if (dataContextAttr != null && dataContextAttr.value !== "") {
            var dataContextAttrBindingMatches = dataContextAttr.value.match(DataBinder.bindingRegex);
            if (dataContextAttrBindingMatches != null && dataContextAttrBindingMatches.length > 0) {
                var dataContextAttrBindingName = dataContextAttrBindingMatches[0].substr(2, dataContextAttrBindingMatches[0].length - 4);
                var binding = this.parentComponent.dataBinder.registerBinding(dataContextAttrBindingName);
                binding.onValueChanged.subscribe(this.dataContextUpdatedCallback);
                this.dataContext = binding.observableValue;
            }
            else {
                throw new Error("Couldn't parse data context binding expression '"
                    + dataContextAttr.value + "' of " + this.tagName
                    + ". Bindings should be of format {{bindingPropertyName}}.");
            }
        }
    };
    Component.prototype.applyShadowTemplate = function () {
        var template = document.querySelector("template#" + this.tagName.toLowerCase());
        if (typeof template !== "undefined" && template != null) {
            var clone = document.importNode(template.content, true);
            this.shadowRoot = this.createShadowRoot();
            for (var i = 0; i < clone.childNodes.length; i++) {
                this.applyMyDataContext(clone.childNodes[i]);
                this.setParentComponent(clone.childNodes[i]);
            }
            this.shadowRoot.appendChild(clone);
            if (window.ShadowDOMPolyfill) {
                var style = this.shadowRoot.querySelector("style");
                if (style) {
                    style.innerHTML = window.WebComponents.ShadowCSS.shimStyle(style, this.tagName.toLowerCase());
                }
            }
            this.dataBinder.bindNodes(this.shadowRoot);
            this.processEventBindings(this.shadowRoot);
        }
    };
    Component.prototype.processEventBindings = function (node) {
        var _this = this;
        if (node.nodeType === 1) {
            for (var i = 0; i < node.attributes.length; i++) {
                var attrName = node.attributes[i].name.toLowerCase();
                var attrValue = node.attributes[i].value;
                if (attrName.substr(0, 11) === "data-event-") {
                    var eventName = attrName.substr(11, attrName.length - 11);
                    if (typeof this[attrValue] !== "undefined") {
                        node.addEventListener(eventName, function (arg) { return _this[attrValue](arg); });
                    }
                }
            }
        }
        for (var i = 0; i < node.childNodes.length; i++) {
            this.processEventBindings(node.childNodes[i]);
        }
    };
    Component.prototype.applyMyDataContext = function (node, dataContext) {
        if (typeof dataContext === "undefined" || dataContext == null) {
            dataContext = this.dataContext;
        }
        if (node instanceof Component) {
            node.dataContext = dataContext;
        }
        else {
            for (var i = 0; i < node.childNodes.length; i++) {
                this.applyMyDataContext(node.childNodes[i], dataContext);
            }
        }
    };
    Component.prototype.setParentComponent = function (node, component) {
        var newParent = this;
        if (component) {
            newParent = component;
        }
        if (node instanceof Component) {
            node.parentComponent = newParent;
        }
        else {
            for (var i = 0; i < node.childNodes.length; i++) {
                this.setParentComponent(node.childNodes[i], component);
            }
        }
    };
    Component.prototype.detachedCallback = function () {
        console.log("Component detached.");
    };
    Component.prototype.attributeChangedCallback = function (attrName, oldVal, newVal) {
        console.log("Attribute '" + attrName + "' changed.");
        if (typeof this[attrName] !== "undefined") {
            if (this[attrName] instanceof Observable) {
                this[attrName].value = newVal;
            }
            else {
                this[attrName] = newVal;
            }
        }
    };
    return Component;
})(HTMLElement);
var Application = (function (_super) {
    __extends(Application, _super);
    function Application() {
        _super.apply(this, arguments);
    }
    Application.prototype.createdCallback = function () {
        _super.prototype.createdCallback.call(this);
        Application.instance = this;
    };
    return Application;
})(Component);
Component.register("ui-application", Application);
var Page = (function (_super) {
    __extends(Page, _super);
    function Page() {
        _super.apply(this, arguments);
    }
    Page.prototype.createdCallback = function () {
        _super.prototype.createdCallback.call(this);
        this.contentNodes = new Array();
    };
    Page.prototype.attachedCallback = function () {
        _super.prototype.attachedCallback.call(this);
        var pageIdAttr = this.attributes.getNamedItem("data-page-id");
        var pageId = "";
        if (pageIdAttr) {
            pageId = pageIdAttr.value;
        }
        var frame = this.parentElement;
        if (frame instanceof Frame) {
            frame.notifyPageLoaded(pageId);
        }
    };
    Page.prototype.show = function () {
        var frame = this.parentNode;
        var template = this.querySelector("template");
        if (template) {
            var clone = document.importNode(template.content, true);
            for (var i = 0; i < clone.childNodes.length; i++) {
                this.contentNodes.push(clone.childNodes[i]);
                this.setParentComponent(clone.childNodes[i]);
            }
            this.appendChild(clone);
            for (var i = 0; i < clone.childNodes.length; i++) {
                this.dataBinder.bindNodes(clone.childNodes[i]);
            }
        }
        else {
            console.error("Page defined without template.");
        }
    };
    Page.prototype.hide = function () {
        return;
    };
    return Page;
})(Component);
Component.register("ui-page", Page);
var Frame = (function (_super) {
    __extends(Frame, _super);
    function Frame() {
        _super.apply(this, arguments);
    }
    Frame.prototype.createdCallback = function () {
        _super.prototype.createdCallback.call(this);
    };
    Frame.prototype.attachedCallback = function () {
        _super.prototype.attachedCallback.call(this);
    };
    Frame.prototype.navigateTo = function (page) {
        if (this.currentPage !== page) {
            if (this.currentPage) {
                this.currentPage.hide();
            }
            this.currentPage = page;
            page.show();
        }
    };
    Frame.prototype.navigateToId = function (pageId) {
        var page;
        for (var i = 0; i < this.children.length; i++) {
            if (this.children[i] instanceof Page
                && this.children[i].attributes.getNamedItem("data-page-id")
                && this.children[i].attributes.getNamedItem("data-page-id").value === pageId) {
                page = this.children[i];
            }
        }
        if (page) {
            this.navigateTo(page);
        }
        else {
            console.error("Attempted to navigate to non-existent page ID '" + pageId + "'.");
        }
    };
    Frame.prototype.notifyPageLoaded = function (pageId) {
        if (this.currentPage) {
            return;
        }
        var defaultPageAttr = this.attributes.getNamedItem("data-default-page");
        if (defaultPageAttr) {
            if (pageId === defaultPageAttr.value) {
                this.navigateToId(pageId);
            }
        }
        else {
            this.navigateToId(pageId);
        }
    };
    return Frame;
})(Component);
Component.register("ui-frame", Frame);
var ObservableArray = (function () {
    function ObservableArray() {
        this.itemStore = new Array();
        this.itemAdded = new EventHandler();
        this.itemRemoved = new EventHandler();
    }
    Object.defineProperty(ObservableArray.prototype, "size", {
        get: function () {
            return this.itemStore.length;
        },
        enumerable: true,
        configurable: true
    });
    ObservableArray.prototype.push = function (item) {
        this.itemStore.push(item);
        this.itemAdded.fire({ item: item, position: this.itemStore.length - 1 });
    };
    ObservableArray.prototype.insert = function (item, index) {
        this.itemStore.splice(index, 0, item);
        this.itemAdded.fire({ item: item, position: index });
    };
    ObservableArray.prototype.get = function (index) {
        return this.itemStore[index];
    };
    ObservableArray.prototype.remove = function (item) {
        var index = this.itemStore.indexOf(item);
        if (index < 0) {
            throw "Item not found in array";
        }
        this.itemStore.splice(index, 1);
        this.itemRemoved.fire({ item: item, position: index });
    };
    ObservableArray.prototype.removeAt = function (index) {
        if (index > this.size - 1) {
            throw "Index outside of array bounds.";
        }
        var item = this.itemStore[index];
        this.itemStore.splice(index, 1);
        this.itemRemoved.fire({ item: item, position: index });
    };
    ObservableArray.prototype.indexOf = function (item) {
        return this.itemStore.indexOf(item);
    };
    return ObservableArray;
})();
var Repeater = (function (_super) {
    __extends(Repeater, _super);
    function Repeater() {
        _super.apply(this, arguments);
    }
    Repeater.prototype.createdCallback = function () {
        _super.prototype.createdCallback.call(this);
        this.repeaterItems = [];
        this.itemEventCallbacks = {};
    };
    Repeater.prototype.attachedCallback = function () {
        var _this = this;
        _super.prototype.attachedCallback.call(this);
        this.template = this.querySelector("template");
        if (this.template == null) {
            throw new Error("Template undefined for repeater component."
                + " A repeater element should always contain a template element.");
        }
        if (!(this.dataContext.value instanceof ObservableArray)) {
            throw new Error("Invalid data context for repeater component."
                + " A repeater element should have an observable array set as the data context.");
        }
        for (var i = 0; i < this.attributes.length; i++) {
            var attributeName = this.attributes[i].name;
            var attributeValue = this.attributes[i].value;
            if (attributeName.indexOf("data-event-item-") === 0) {
                var eventName = attributeName.replace("data-event-item-", "");
                if (this.parentComponent && this.parentComponent[attributeValue]) {
                    this.itemEventCallbacks[eventName] = this.parentComponent[attributeValue];
                }
                else {
                    console.error(this.tagName + " attempted to bind event to unexisting callback '"
                        + attributeValue + "' on "
                        + this.parentComponent.tagName);
                }
            }
        }
        if (this.dataContext && this.dataContext.value instanceof ObservableArray) {
            this.populateAllItems();
        }
        else {
            console.warn(this.tagName + " attached without a valid data context, expecting an ObservableArray.");
        }
        this.dataContext.value.itemAdded.subscribe(function (arg) { return _this.itemAdded(arg); });
        this.dataContext.value.itemRemoved.subscribe(function (arg) { return _this.itemRemoved(arg); });
    };
    Repeater.prototype.processEventBindings = function (node) {
        return;
    };
    Repeater.prototype.dataContextUpdated = function (oldContext, newContext) {
        var _this = this;
        _super.prototype.dataContextUpdated.call(this, oldContext, newContext);
        this.clearItems();
        this.populateAllItems();
        this.dataContext.value.itemAdded.subscribe(function (arg) { return _this.itemAdded(arg); });
        this.dataContext.value.itemRemoved.subscribe(function (arg) { return _this.itemRemoved(arg); });
    };
    Repeater.prototype.itemAdded = function (arg) {
        var itemDataContext = new Observable(arg.item);
        this.addItem(itemDataContext, arg.position);
    };
    Repeater.prototype.itemRemoved = function (arg) {
        this.removeItem(arg.position);
    };
    Repeater.prototype.populateAllItems = function () {
        var array = this.dataContext.value;
        for (var i = 0; i < array.size; i++) {
            var itemDataContext = new Observable(array.get(i));
            this.addItem(itemDataContext);
        }
    };
    Repeater.prototype.addItem = function (dataContext, position) {
        if (typeof position === "undefined") {
            position = this.repeaterItems.length;
        }
        var newItem = {
            dataContext: dataContext,
            dataBinder: new DataBinder(dataContext),
            nodes: []
        };
        var clone = document.importNode(this.template.content, true);
        for (var i = 0; i < clone.childNodes.length; i++) {
            newItem.nodes.push(clone.childNodes[i]);
            this.applyMyDataContext(clone.childNodes[i], dataContext);
            this.setParentComponent(clone.childNodes[i], this.parentComponent);
            this.applyRepeaterEvents(clone.childNodes[i], dataContext);
            newItem.dataBinder.bindNodes(clone.childNodes[i]);
        }
        var refNode = null;
        if (this.repeaterItems.length === 0) {
            refNode = this.nextSibling;
        }
        else if (position < this.repeaterItems.length) {
            refNode = this.repeaterItems[position].nodes[0];
        }
        else {
            var lastItem = this.repeaterItems[this.repeaterItems.length - 1];
            refNode = lastItem.nodes[lastItem.nodes.length - 1].nextSibling;
        }
        this.repeaterItems.splice(position, 0, newItem);
        this.parentNode.insertBefore(clone, refNode);
    };
    Repeater.prototype.removeItem = function (position) {
        var item = this.repeaterItems[position];
        this.repeaterItems.splice(position, 1);
        item.dataBinder.removeAllBindings();
        var nodesToBeRemoved = item.nodes;
        for (var i = 0; i < nodesToBeRemoved.length; i++) {
            nodesToBeRemoved[i].parentNode.removeChild(nodesToBeRemoved[i]);
        }
    };
    Repeater.prototype.clearItems = function () {
        for (var i = this.repeaterItems.length - 1; i >= 0; i--) {
            this.removeItem(i);
        }
    };
    Repeater.prototype.applyRepeaterEvents = function (node, dataContext) {
        var _this = this;
        for (var eventName in this.itemEventCallbacks) {
            if (this.itemEventCallbacks[eventName]) {
                node.addEventListener(eventName, function (args) { return _this.itemEventCallbacks[eventName](dataContext); });
            }
        }
    };
    return Repeater;
})(Component);
Component.register("ui-repeater", Repeater);
var AutoMapper = (function () {
    function AutoMapper() {
    }
    AutoMapper.map = function (from, to) {
        var newObj = new to();
        for (var i in newObj) {
            if (newObj.hasOwnProperty(i) && typeof newObj[i].value !== "undefined") {
                if (typeof from[i] !== "undefined") {
                    if (typeof from[i].value !== "undefined") {
                        newObj[i].value = from[i].value;
                    }
                    else {
                        newObj[i].value = from[i];
                    }
                }
            }
        }
        return newObj;
    };
    return AutoMapper;
})();
var ObservableProxy = (function () {
    function ObservableProxy(source, outgoing, incoming) {
        var _this = this;
        this.source = source;
        this.outgoing = outgoing;
        this.incoming = incoming;
        this.onValueChanged = new EventHandler();
        this.source.onValueChanged.subscribe(function (arg) {
            _this.onValueChanged.fire({ oldValue: _this.outgoing(arg.oldValue), newValue: _this.outgoing(arg.newValue) });
        });
    }
    Object.defineProperty(ObservableProxy.prototype, "value", {
        get: function () {
            return this.outgoing(this.source.value);
        },
        set: function (val) {
            this.source.value = this.incoming(val, this.source.value);
        },
        enumerable: true,
        configurable: true
    });
    return ObservableProxy;
})();
//# sourceMappingURL=boink.js.map