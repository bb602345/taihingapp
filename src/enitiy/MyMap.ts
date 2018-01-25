

class MyMap<K, V> extends Map<K,V>{
    private lastupdatekey: K;

    public get lastUpdateKey() : K{
        return this.lastUpdateKey
    }

    constructor(){
        super();
    }
    set(key:K, value:V) : this{
        this.lastupdatekey = key;
        return super.set(key, value);
    }

    
}