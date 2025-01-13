class ApiFeatures {
  constructor(mongooseQuery, queryString) {
    this.mongooseQuery = mongooseQuery;
    this.queryString = queryString;
  }

  filter() {
    // في ال3 اكواد هدول بياخد كويري معينه بس
    const queryStringObj = { ...this.queryString }; // هادا معناه اني باخد نسخة من req.body
    const excludesFields = ["page", "sort", "limit", "fields"];
    excludesFields.forEach((field) => delete queryStringObj[field]);

    //هان عشان احط علامة $ جنب الاكسبرشن الي موجودات تحت زي gte
    let queryStr = JSON.stringify(queryStringObj);
    queryStr = queryStr.replace(/\b(gte|gt|lte|lt)\b/g, (match) => `$${match}`);

    this.mongooseQuery = this.mongooseQuery.find(JSON.parse(queryStr));

    return this;
  }

  sort() {
    // Sorting
    if (this.queryString.sort) {
      const sortBy = this.queryString.sort.split(",").join(" ");
      this.mongooseQuery = this.mongooseQuery.sort(sortBy);
    } else {
      this.mongooseQuery = this.mongooseQuery.sort("-createdAt");
    }
    return this;
  }

  // search() {
  //   let query = {};
  //   query = { username: { $regex: this.queryString.keyword, $options: "i" } };
  //   if (this.queryString.keyword) {
  //     this.mongooseQuery = this.mongooseQuery.find(query);
  //   }
  //   return this;
  // }

  limitFields() {
    // Fields Limiting
    if (this.queryString.fields) {
      const fields = this.queryString.fields.split(",").join(" ");
      this.mongooseQuery = this.mongooseQuery.select(fields);
    } else {
      this.mongooseQuery = this.mongooseQuery.select("-__v");
    }
    return this;
  }

  paginate(countDocuments) {
    // Pagination
    const page = this.queryString.page * 1 || 1; // ضربت في 1 عشان احول من سترنق لانتجر
    const limit = this.queryString.limit * 1 || 10;
    const skip = (page - 1) * limit;
    const endPageIndex = page * limit;

    const pagination = {};
    pagination.currentPage = page;
    pagination.limit = limit;
    pagination.numberOfPages = Math.ceil(countDocuments / limit);
    if (endPageIndex < countDocuments) {
      pagination.next = page + 1;
    }
    if (skip > 0) {
      pagination.prev = page - 1;
    }
    this.mongooseQuery = this.mongooseQuery.skip(skip).limit(limit);
    this.paginationResult = pagination;
    return this;
  }
}
module.exports = ApiFeatures;
