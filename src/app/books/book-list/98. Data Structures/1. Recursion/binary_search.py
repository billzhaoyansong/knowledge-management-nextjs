def binary_search(ls, x):
    if not ls:
        return False
    
    def _f(ls, l, r, x):
        if l > r:
            return False

        m = (l + r) // 2 
        if ls[m] == x:
            return True
        elif ls[m] > x:
            r = m - 1
            return _f(ls, l, r, x)
        else:
            l = m + 1
            return _f(ls, l, r, x)
    
    return _f(ls, 0, len(ls) - 1, x)
    
if __name__ == '__main__':
    print(binary_search([1,3,5,7,8], 4))