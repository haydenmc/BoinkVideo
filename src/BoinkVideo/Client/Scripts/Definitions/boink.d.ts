declare class EventHandler<T> {
    private callbacks;
    constructor();
    subscribe(callback: (arg: T) => void): void;
    unSubscribe(callback: (arg: T) => void): void;
    unSubscribeAll(): void;
    fire(arg: T): void;
}
interface IObservable<T> {
    value: T;
    onValueChanged: EventHandler<ValueChangedEvent<T>>;
}
interface ValueChangedEvent<T> {
    oldValue: T;
    newValue: T;
}
declare class Observable<T> implements IObservable<T> {
    private _value;
    value: T;
    private _onValueChanged;
    onValueChanged: EventHandler<ValueChangedEvent<T>>;
    constructor(defaultValue?: T);
}
declare class DataBinding {
    dataBinder: DataBinder;
    path: string;
    property: string;
    childBindings: {
        [property: string]: DataBinding;
    };
    private updateCallback;
    onValueChanged: EventHandler<DataBindingValueChangedEvent>;
    value: any;
    observableValue: IObservable<any>;
    constructor(path: string, dataBinder: DataBinder);
    reattachChildren(binding?: DataBinding, detachFrom?: IObservable<any>): void;
    reattachBinding(detachFrom?: IObservable<any>): void;
    attachBinding(): void;
    detachBinding(detachFrom?: IObservable<any>): void;
    releaseListeners(): void;
}
declare class DataBindingValueChangedEvent {
    path: string;
    binding: DataBinding;
    valueChangedEvent: ValueChangedEvent<any>;
}
declare class NodeBinding {
    node: Node;
    bindings: DataBinding[];
    private originalValue;
    updateCallback: (args) => void;
    constructor(node: Node, bindings: DataBinding[]);
    updateNode(): void;
}
declare class DataBinder {
    static bindingRegex: RegExp;
    protected bindingTree: DataBinding;
    protected nodeBindings: NodeBinding[];
    private _dataContext;
    dataContext: IObservable<any>;
    constructor(dataContext?: IObservable<any>);
    static parseBindings(str: string): string[];
    bindNodes(node: Node): void;
    registerBinding(path: string): DataBinding;
    removeAllBindings(binding?: DataBinding): void;
    static resolvePropertyPath(path: string, dataContext: IObservable<any>): IObservable<any>;
}
declare class Component extends HTMLElement {
    protected shadowRoot: any;
    protected _dataContext: IObservable<any>;
    dataContext: IObservable<any>;
    parentComponent: Component;
    protected dataBinder: DataBinder;
    private dataContextUpdatedCallback;
    constructor();
    static register(elementName: string, theClass: any): void;
    createdCallback(): void;
    attachedCallback(): void;
    dataContextUpdated(oldContext: IObservable<any>, newContext: IObservable<any>): void;
    protected processDataContextAttributeBinding(): void;
    protected applyShadowTemplate(): void;
    protected processEventBindings(node: Node): void;
    protected applyMyDataContext(node: Node, dataContext?: IObservable<any>): void;
    protected setParentComponent(node: Node, component?: Component): void;
    detachedCallback(): void;
    attributeChangedCallback(attrName: string, oldVal: string, newVal: string): void;
}
declare class Application extends Component {
    static instance: any;
    createdCallback(): void;
}
declare class Page extends Component {
    private contentNodes;
    createdCallback(): void;
    attachedCallback(): void;
    show(): void;
    hide(): void;
}
declare class Frame extends Component {
    private currentPage;
    createdCallback(): void;
    attachedCallback(): void;
    navigateTo(page: Page): void;
    navigateToId(pageId: string): void;
    notifyPageLoaded(pageId: string): void;
}
interface ObservableArrayEventArgs<T> {
    item: T;
    position: number;
}
declare class ObservableArray<T> {
    itemAdded: EventHandler<ObservableArrayEventArgs<T>>;
    itemRemoved: EventHandler<ObservableArrayEventArgs<T>>;
    size: number;
    private itemStore;
    constructor();
    push(item: T): void;
    insert(item: T, index: number): void;
    get(index: number): T;
    remove(item: T): void;
    removeAt(index: number): void;
    indexOf(item: T): number;
}
declare class Repeater extends Component {
    private template;
    private repeaterItems;
    private itemEventCallbacks;
    createdCallback(): void;
    attachedCallback(): void;
    protected processEventBindings(node: Node): void;
    dataContextUpdated(oldContext: IObservable<any>, newContext: IObservable<any>): void;
    itemAdded(arg: ObservableArrayEventArgs<any>): void;
    itemRemoved(arg: ObservableArrayEventArgs<any>): void;
    private populateAllItems();
    private addItem(dataContext, position?);
    private removeItem(position);
    private clearItems();
    private applyRepeaterEvents(node, dataContext);
}
interface RepeaterItem {
    dataContext: IObservable<any>;
    dataBinder: DataBinder;
    nodes: Node[];
}
declare class AutoMapper {
    static map(from: any, to: {
        new (): any;
    }): any;
}
declare class ObservableProxy<T, U> implements IObservable<T> {
    private source;
    private outgoing;
    private incoming;
    value: T;
    onValueChanged: EventHandler<ValueChangedEvent<T>>;
    constructor(source: IObservable<U>, outgoing: (source: U) => T, incoming: (source: T, value: U) => U);
}
