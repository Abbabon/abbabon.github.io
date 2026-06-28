# frozen_string_literal: true

source "https://rubygems.org"

gemspec
#gem 'jemoji'

# Run Jekyll 4.x. The gemspec allows ">= 3.9.3"; pin the app to the 4.x line.
gem "jekyll", "~> 4.4"

# These gems left Ruby's default set in 3.4+, but some (transitive) deps still
# require them. Add them only on Ruby 3.4+; on older Ruby they are still part
# of the standard library. GitHub Pages builds in its own environment and
# ignores these.
if Gem::Version.new(RUBY_VERSION) >= Gem::Version.new("3.4.0")
  gem "csv"
  gem "base64"
  gem "bigdecimal"
  gem "logger"
end