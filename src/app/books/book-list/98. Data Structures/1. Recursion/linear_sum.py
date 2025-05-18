def linear_sum(ls):
    if len(ls) == 1:
        return ls[0]

    return ls[-1] + linear_sum(ls[0:-1])

if __name__ == '__main__':
    print(linear_sum([1,2,3,4,5,6]))