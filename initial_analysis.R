raw_data = read.csv("HHI + Ed.csv")
raw_data$Percent_No_HS[raw_data$Percent_No_HS == " -   "] = NaN
raw_data$Percent_No_HS = as.numeric(raw_data$Percent_No_HS)
raw_data$Median_HHI = as.numeric(raw_data$Median_HHI)
model = lm(data = raw_data, formula = Percent_No_HS~Median_HHI)
plot(raw_data$Median_HHI, raw_data$Percent_No_HS)
abline(model)
summary(model)
