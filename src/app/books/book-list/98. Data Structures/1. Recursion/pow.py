def pow(x, n):
    if n == 1:
        return x
    
    a, b = n // 2, n % 2
    
    y = pow(x, a)

    return y * y * x if b == 1 else y * y

if __name__ == '__main__':
    print(pow(2,5))