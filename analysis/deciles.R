get_deciles = function(x){
  x = x[complete.cases(x)]
  x = as.vector(x);
  med = median(x);
  print(sprintf("Median: %f; Min: %f; Max: %f", med, min(x), max(x)))
  hundreth =  med/.5
  deciles = hundreth*(1:10/10)
  deciles = rbind(1:10*10, deciles)
  return(deciles)
}
get_deciles(clean_data$Median_HHI)
quantile(clean_data$Median_HHI, prob=1:10/10)