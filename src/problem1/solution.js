var sum_to_n_a = function(n) {
    let res = 0;
    for (let i = 0; i < n + 1; i++) {
        res += i;
    }
    return res;
};

var sum_to_n_b = function(n) {
    if (n == 0) {
        return 0;
    }

    return n + sum_to_n_b(n - 1);
};

var sum_to_n_c = function(n) {
    return n * (n + 1) / 2;
};

console.log(sum_to_n_a(10));
console.log(sum_to_n_b(10));
console.log(sum_to_n_c(10));