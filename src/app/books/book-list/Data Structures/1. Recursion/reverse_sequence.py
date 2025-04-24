def reverse(ls):
    if not ls:
        return
        
    def _f(ls, l, r):
        if l >= r:
            return
        ls[l], ls[r] = ls[r], ls[l]
        _f(ls, l + 1, r-1)
        
    _f(ls, 0, len(ls) - 1)
        
if __name__ == '__main__':
    ls = [1,2,3,4,5]
    print('before reverse:')
    print(ls)
    
    reverse(ls)
    print('after reverse:')
    print(ls)
