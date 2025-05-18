def max_seq(ls):
    if not ls:
        return None

    def _f(ls, i):
        if i == 0:
            return ls[0]
        
        return ls[i] if ls[i] >= _f(ls, i - 1) else _f(ls, i - 1)

    return _f(ls, len(ls) - 1)
    
if __name__ == '__main__':
    print(max_seq([1,4,2,7,3,8,5]))